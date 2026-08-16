"""High / Medium / Low LLM leagues with provider fallback and quota downgrade."""

from __future__ import annotations

import logging
from typing import Optional

import httpx

from agents.llm_client import LLMResult, invoke_provider, parse_model_id, provider_available
from app.core.config import settings
from app.services import llm_quota

logger = logging.getLogger("dravya.llm_leagues")

LEAGUE_ORDER = ("high", "medium", "low")
ROUTE_TO_LEAGUE = {"simple": "low", "complex": "medium", "critical": "high"}


class QuotaExceeded(RuntimeError):
    def __init__(self, message: str, reset_at: str) -> None:
        super().__init__(message)
        self.reset_at = reset_at


def parse_chain(raw: str) -> list[str]:
    return [item.strip() for item in raw.split(",") if item.strip()]


def chain_for(league: str) -> list[str]:
    league = league.lower()
    if league == "high":
        return parse_chain(settings.LLM_HIGH_CHAIN)
    if league == "medium":
        return parse_chain(settings.LLM_MEDIUM_CHAIN)
    return parse_chain(settings.LLM_LOW_CHAIN)


def catalog() -> list[dict]:
    return [
        {
            "id": "high",
            "label": "High",
            "blurb": "Grok 4.5 / GPT-5.6",
            "models": chain_for("high"),
        },
        {
            "id": "medium",
            "label": "Medium",
            "blurb": "Mistral on Groq",
            "models": chain_for("medium"),
        },
        {
            "id": "low",
            "label": "Low",
            "blurb": "Fast",
            "models": chain_for("low"),
        },
    ]


def available_specs(league: str) -> list[str]:
    return [spec for spec in chain_for(league) if provider_available(spec)]


def fallback_leagues(requested: str) -> list[str]:
    requested = (requested or "medium").lower()
    if requested not in LEAGUE_ORDER:
        requested = "medium"
    start = LEAGUE_ORDER.index(requested)
    return list(LEAGUE_ORDER[start:])


async def resolve_call(
    system_prompt: str,
    user_message: str,
    *,
    requested_league: Optional[str] = None,
    user_id: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> LLMResult:
    """Walk league chains until a provider succeeds and quota allows it."""
    requested = (requested_league or "medium").lower()
    if requested not in LEAGUE_ORDER:
        requested = "medium"
    last_error: Exception | None = None
    tried_any = False

    if model and not requested_league:
        provider, name = parse_model_id(model)
        league = "low"
        if user_id and await llm_quota.would_exceed(user_id, league):
            raise QuotaExceeded("Daily LLM limit reached", llm_quota.reset_at_iso())
        result = await invoke_provider(
            provider, name, system_prompt, user_message,
            temperature=temperature, max_tokens=max_tokens,
        )
        result.league = league
        result.league_requested = requested
        if user_id:
            await llm_quota.record(user_id, league, result.total_tokens)
        return result

    for league in fallback_leagues(requested):
        if user_id and await llm_quota.would_exceed(user_id, league):
            logger.info("League %s quota exhausted for user %s", league, user_id)
            continue
        specs = available_specs(league)
        if not specs:
            logger.info("League %s has no configured providers", league)
            continue
        for spec in specs:
            provider, name = parse_model_id(spec)
            tried_any = True
            try:
                result = await invoke_provider(
                    provider, name, system_prompt, user_message,
                    temperature=temperature, max_tokens=max_tokens,
                )
                result.league = league
                result.league_requested = requested
                result.downgraded = league != requested
                if user_id:
                    await llm_quota.record(user_id, league, result.total_tokens)
                if result.downgraded:
                    logger.info("Downgraded %s → %s using %s", requested, league, spec)
                return result
            except (httpx.HTTPStatusError, RuntimeError, httpx.TimeoutException) as exc:
                last_error = exc
                logger.warning("Provider %s failed, trying next: %s", spec, exc)
                continue

    reset_at = llm_quota.reset_at_iso()
    if not tried_any:
        raise QuotaExceeded(
            f"Daily LLM limit reached for all leagues. Try again after {reset_at}.",
            reset_at,
        )
    raise RuntimeError(f"All LLM providers failed: {last_error}")


async def usage_snapshot(user_id: str) -> dict:
    leagues = {}
    for league in LEAGUE_ORDER:
        leagues[league] = await llm_quota.remaining(user_id, league)
    return {"reset_at": llm_quota.reset_at_iso(), "leagues": leagues}
