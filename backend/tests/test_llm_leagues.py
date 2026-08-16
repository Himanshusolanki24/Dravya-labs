import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DRAVYA_HASH_EMBEDDINGS", "1")
os.environ.setdefault("HELIX_DB_API_KEY", "")

from agents.llm_client import LLMResult, parse_model_id
from agents.llm_leagues import resolve_call
from app.services import llm_quota


class ParseModelIdTests(unittest.TestCase):
    def test_explicit_provider(self):
        self.assertEqual(parse_model_id("xai:grok-4.5"), ("xai", "grok-4.5"))
        self.assertEqual(parse_model_id("openrouter:x-ai/grok-4.5"), ("openrouter", "x-ai/grok-4.5"))
        self.assertEqual(parse_model_id("groq:mistral-saba-24b"), ("groq", "mistral-saba-24b"))


class QuotaTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        llm_quota.reset_memory()

    async def test_request_cap_trips(self):
        with patch("app.services.llm_quota.caps_for", return_value=(1, 100000)):
            self.assertFalse(await llm_quota.would_exceed("user-a", "high"))
            await llm_quota.record("user-a", "high", 10)
            self.assertTrue(await llm_quota.would_exceed("user-a", "high"))

    async def test_token_cap_trips_independently(self):
        with patch("app.services.llm_quota.caps_for", return_value=(50, 20)):
            await llm_quota.record("user-b", "medium", 20)
            self.assertTrue(await llm_quota.would_exceed("user-b", "medium"))


class ResolverTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        llm_quota.reset_memory()

    async def test_missing_openai_falls_to_grok(self):
        async def fake_invoke(provider, model, *args, **kwargs):
            if provider == "openai":
                raise RuntimeError("OPENAI_API_KEY missing")
            return LLMResult(text="from grok", provider=provider, model=model, prompt_tokens=8, completion_tokens=4)

        chains = {
            "high": ["openai:gpt-5.6", "xai:grok-4.5"],
            "medium": ["groq:mistral-saba-24b"],
            "low": ["groq:llama-3.3-70b-versatile"],
        }
        with patch("agents.llm_leagues.chain_for", side_effect=lambda league: chains[league]), patch(
            "agents.llm_leagues.provider_available", return_value=True
        ), patch("agents.llm_leagues.invoke_provider", side_effect=fake_invoke):
            result = await resolve_call("sys", "hi", requested_league="high", user_id="u-high")
        self.assertEqual(result.provider, "xai")
        self.assertEqual(result.model, "grok-4.5")
        self.assertFalse(result.downgraded)

    async def test_high_quota_falls_to_medium_groq(self):
        async def fake_invoke(provider, model, *args, **kwargs):
            return LLMResult(text="ok", provider=provider, model=model, prompt_tokens=1, completion_tokens=1)

        chains = {
            "high": ["openai:gpt-5.6"],
            "medium": ["groq:mistral-saba-24b"],
            "low": ["groq:llama-3.3-70b-versatile"],
        }
        with patch("app.services.llm_quota.caps_for", side_effect=lambda league: (1, 10000) if league == "high" else (50, 200000)), patch(
            "agents.llm_leagues.chain_for", side_effect=lambda league: chains[league]
        ), patch("agents.llm_leagues.provider_available", return_value=True), patch(
            "agents.llm_leagues.invoke_provider", side_effect=fake_invoke
        ):
            first = await resolve_call("sys", "one", requested_league="high", user_id="u-cap")
            self.assertEqual(first.league, "high")
            second = await resolve_call("sys", "two", requested_league="high", user_id="u-cap")
            self.assertEqual(second.provider, "groq")
            self.assertEqual(second.model, "mistral-saba-24b")
            self.assertTrue(second.downgraded)
            self.assertEqual(second.league, "medium")


if __name__ == "__main__":
    unittest.main()
