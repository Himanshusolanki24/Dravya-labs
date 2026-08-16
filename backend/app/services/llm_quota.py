"""Per-user daily LLM request and token caps (Redis, with in-memory fallback)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from app.core.config import settings
from app.services.redis_cache import get_redis

LEAGUES = ("high", "medium", "low")
_memory: dict[str, dict[str, int]] = {}


def utc_day() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def reset_at_iso() -> str:
    now = datetime.now(timezone.utc)
    nxt = now.replace(hour=0, minute=0, second=0, microsecond=0)
    from datetime import timedelta

    nxt = nxt + timedelta(days=1)
    return nxt.isoformat()


def caps_for(league: str) -> tuple[int, int]:
    league = league.lower()
    if league == "high":
        return settings.LLM_HIGH_DAILY_REQUESTS, settings.LLM_HIGH_DAILY_TOKENS
    if league == "medium":
        return settings.LLM_MEDIUM_DAILY_REQUESTS, settings.LLM_MEDIUM_DAILY_TOKENS
    return settings.LLM_LOW_DAILY_REQUESTS, settings.LLM_LOW_DAILY_TOKENS


def _key(user_id: str, day: Optional[str] = None) -> str:
    return f"llm:quota:{user_id}:{day or utc_day()}"


def _empty() -> dict[str, int]:
    row: dict[str, int] = {}
    for league in LEAGUES:
        row[f"{league}_req"] = 0
        row[f"{league}_tok"] = 0
    return row


async def _load(user_id: str) -> dict[str, int]:
    key = _key(user_id)
    client = await get_redis()
    if client is not None:
        try:
            raw = await client.hgetall(key)
            if raw:
                return {k: int(v) for k, v in raw.items()}
        except Exception:
            pass
    return dict(_memory.get(key, _empty()))


async def remaining(user_id: str, league: str) -> dict:
    league = league.lower()
    used = await _load(user_id)
    req_cap, tok_cap = caps_for(league)
    req_used = used.get(f"{league}_req", 0)
    tok_used = used.get(f"{league}_tok", 0)
    return {
        "league": league,
        "requests_used": req_used,
        "tokens_used": tok_used,
        "requests_left": max(0, req_cap - req_used),
        "tokens_left": max(0, tok_cap - tok_used),
        "requests_cap": req_cap,
        "tokens_cap": tok_cap,
        "reset_at": reset_at_iso(),
    }


async def would_exceed(user_id: str, league: str, extra_tokens: int = 0) -> bool:
    snap = await remaining(user_id, league)
    if snap["requests_left"] <= 0:
        return True
    if snap["tokens_left"] <= 0:
        return True
    if extra_tokens and snap["tokens_left"] <= extra_tokens:
        return True
    return False


async def record(user_id: str, league: str, tokens: int) -> dict:
    league = league.lower()
    key = _key(user_id)
    tokens = max(0, int(tokens))
    client = await get_redis()
    if client is not None:
        try:
            pipe = client.pipeline()
            pipe.hincrby(key, f"{league}_req", 1)
            pipe.hincrby(key, f"{league}_tok", tokens)
            pipe.expire(key, 60 * 60 * 48)
            await pipe.execute()
            return await remaining(user_id, league)
        except Exception:
            pass
    row = _memory.setdefault(key, _empty())
    row[f"{league}_req"] = row.get(f"{league}_req", 0) + 1
    row[f"{league}_tok"] = row.get(f"{league}_tok", 0) + tokens
    return await remaining(user_id, league)


def reset_memory() -> None:
    _memory.clear()
