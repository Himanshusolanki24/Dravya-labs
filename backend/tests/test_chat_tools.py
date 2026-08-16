import os
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DRAVYA_HASH_EMBEDDINGS", "1")
os.environ.setdefault("HELIX_DB_API_KEY", "")

from app.mcp.caveman import compose_system, max_tokens_for
from app.mcp.providers import search_knowledge
from app.services.chat_settings import DEFAULT_SKILLS, enabled_skill_bodies


class CavemanPromptTests(unittest.TestCase):
    def test_caveman_is_shorter_and_flags_mode(self):
        long_profile = "x" * 2000
        normal = compose_system(
            caveman=False,
            skill_bodies=["Diet coach: favor warm food."],
            profile_context=long_profile,
            mcp_context="- Notion: tea notes",
            rag="retrieved " * 400,
        )
        cave = compose_system(
            caveman=True,
            skill_bodies=["Diet coach: favor warm food."],
            profile_context=long_profile,
            mcp_context="- Notion: tea notes",
            rag="retrieved " * 400,
        )
        self.assertIn("CAVEMAN MODE", cave)
        self.assertLess(len(cave), len(normal))
        self.assertEqual(max_tokens_for(True), 512)

    def test_knowledge_search_hits_dosha(self):
        hits = search_knowledge("vata dryness routine")
        self.assertTrue(hits)
        self.assertTrue(any("vata" in hit.lower() for hit in hits))

    def test_client_skills_override_stored(self):
        stored = {"skills": DEFAULT_SKILLS}
        bodies = enabled_skill_bodies(stored, extra_bodies=["Only talk about sleep."])
        self.assertEqual(bodies, ["Only talk about sleep."])


if __name__ == "__main__":
    unittest.main()
