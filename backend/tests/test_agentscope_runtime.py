import os
import sys
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DRAVYA_HASH_EMBEDDINGS", "1")
os.environ.setdefault("HELIX_DB_API_KEY", "")
os.environ.setdefault("USE_AGENTSCOPE", "true")


from app.agentscope_runtime.helix_store import HelixVDBStore, VectorRecord
from app.agentscope_runtime.knowledge import reset_knowledge_registry
from app.agentscope_runtime.chat_model import ChatResponse, DravyaChatModel
from agents.schemas import MLFacts, SharedState, UserProfile, SymptomsInput


class HelixVDBStoreTests(unittest.IsolatedAsyncioTestCase):
    async def test_memory_search_returns_nearest_vector(self):
        store = HelixVDBStore()
        await store.insert(
            "ayurveda_classical",
            [
                VectorRecord(vector=[1.0, 0.0, 0.0], document_id="a", text="vata grounding foods"),
                VectorRecord(vector=[0.0, 1.0, 0.0], document_id="b", text="pitta cooling foods"),
            ],
        )
        hits = await store.search("ayurveda_classical", [0.95, 0.05, 0.0], top_k=1)
        self.assertEqual(len(hits), 1)
        self.assertEqual(hits[0].document_id, "a")
        self.assertIn("vata", hits[0].text)

    async def test_metadata_filter(self):
        store = HelixVDBStore()
        await store.insert(
            "user_consultations",
            [
                VectorRecord(
                    vector=[1.0, 0.0],
                    document_id="u1",
                    text="user one history",
                    metadata={"user_id": "one"},
                ),
                VectorRecord(
                    vector=[1.0, 0.0],
                    document_id="u2",
                    text="user two history",
                    metadata={"user_id": "two"},
                ),
            ],
        )
        hits = await store.search("user_consultations", [1.0, 0.0], top_k=5, metadata_filter={"user_id": "two"})
        self.assertEqual(len(hits), 1)
        self.assertEqual(hits[0].document_id, "u2")


class FakeChatModel(DravyaChatModel):
    def __init__(self) -> None:
        super().__init__(model="fake")

    async def __call__(self, system_prompt, user_message, **kwargs):
        return ChatResponse(
            text="## Constitution\nKapha.\n\n## Safety\nEducational wellness guidance only.",
            model_used="fake",
        )


class AgentScopePipelineTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        reset_knowledge_registry()

    async def test_pipeline_with_empty_kb_returns_ml_plan(self):
        from agents.agentscope_orchestrator import run_agentscope_pipeline

        async def ml_runner(state):
            return MLFacts(
                dominant_dosha="kapha",
                herbs={"matches": [{"name": "Triphala", "preview": "digestive"}]},
                dietplain={"matches": [{"food_name": "barley"}]},
            )

        state = SharedState(
            user_profile=UserProfile(user_id="user-test"),
            symptoms_input=SymptomsInput(chief_complaint="slow digestion"),
        )

        with patch(
            "agents.agentscope_orchestrator.retrieve_health_context",
            new=AsyncMock(return_value={"profile": None, "history": [], "memories": []}),
        ), patch(
            "agents.agentscope_orchestrator.save_consultation",
            new=AsyncMock(return_value=True),
        ), patch(
            "agents.critic_agent.CriticAgent.evaluate",
            new=AsyncMock(return_value=__import__("agents.schemas", fromlist=["CritiqueResult"]).CritiqueResult(approved=True)),
        ):
            result = await run_agentscope_pipeline(
                state,
                ml_runner=ml_runner,
                chat_model=FakeChatModel(),
            )

        self.assertEqual(result.status, "success")
        self.assertEqual(result.prakriti.dominant_dosha, "kapha")
        self.assertTrue(result.orchestrator_summary)
        self.assertEqual(result.herbs.herbs[0].name, "Triphala")
        self.assertIn("barley", result.diet.foods_to_eat)


if __name__ == "__main__":
    unittest.main()
