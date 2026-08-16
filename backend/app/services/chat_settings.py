"""Per-user chat skills, caveman flag, and MCP connection secrets."""

from __future__ import annotations

import copy
import json
import uuid
from typing import Any, Optional

from app.services.redis_cache import cache_get, cache_set, get_redis

DEFAULT_SKILLS: list[dict[str, Any]] = [
    {
        "id": "diet-coach",
        "name": "Diet coach",
        "enabled": False,
        "body": "Lead with food. Name 3 foods to favor and 3 to reduce for the user's dosha. No long essays.",
    },
    {
        "id": "herb-protocol",
        "name": "Herb protocol",
        "enabled": False,
        "body": "If suggesting herbs, give name, typical culinary/tea use, and one contraindication. Never high-dose or pregnancy herbs without a caution.",
    },
    {
        "id": "pcos-cycle",
        "name": "PCOS / cycle",
        "enabled": False,
        "body": "When relevant, tie advice to cycle regularity, insulin, and Kapha-Pitta patterns. Stay educational.",
    },
]

_memory: dict[str, dict[str, Any]] = {}
_TTL = 60 * 60 * 24 * 90


def _key(user_id: str) -> str:
    return f"chat:tools:{user_id}"


def default_settings() -> dict[str, Any]:
    return {
        "caveman": False,
        "skills": copy.deepcopy(DEFAULT_SKILLS),
        "mcp": {
            "knowledge": True,
            "notion": {"enabled": False, "token": ""},
            "obsidian": {"enabled": False, "base_url": "https://127.0.0.1:27124", "api_key": ""},
        },
    }


def _encrypt_secrets(raw: dict[str, Any]) -> dict[str, Any]:
    from app.utils.encryption import encrypt_json

    stored = copy.deepcopy(raw)
    notion = stored.get("mcp", {}).get("notion") or {}
    if notion.get("token"):
        notion["token"] = encrypt_json(notion["token"])
    obsidian = stored.get("mcp", {}).get("obsidian") or {}
    if obsidian.get("api_key"):
        obsidian["api_key"] = encrypt_json(obsidian["api_key"])
    return stored


def _decrypt_secrets(raw: dict[str, Any]) -> dict[str, Any]:
    from app.utils.encryption import decrypt_json

    data = copy.deepcopy(raw)
    notion = data.get("mcp", {}).get("notion") or {}
    token = notion.get("token") or ""
    if token:
        try:
            notion["token"] = decrypt_json(token)
        except Exception:
            pass
    obsidian = data.get("mcp", {}).get("obsidian") or {}
    key = obsidian.get("api_key") or ""
    if key:
        try:
            obsidian["api_key"] = decrypt_json(key)
        except Exception:
            pass
    return data


def public_view(raw: dict[str, Any]) -> dict[str, Any]:
    view = copy.deepcopy(raw)
    notion = view.get("mcp", {}).get("notion") or {}
    token = notion.pop("token", "") or ""
    notion["configured"] = bool(token)
    obsidian = view.get("mcp", {}).get("obsidian") or {}
    key = obsidian.pop("api_key", "") or ""
    obsidian["configured"] = bool(key)
    return view


def _merge_skills(incoming: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    if not incoming:
        return copy.deepcopy(DEFAULT_SKILLS)
    cleaned: list[dict[str, Any]] = []
    for item in incoming[:20]:
        name = str(item.get("name") or "").strip()[:80]
        body = str(item.get("body") or "").strip()[:2000]
        if not name or not body:
            continue
        cleaned.append({
            "id": str(item.get("id") or uuid.uuid4()),
            "name": name,
            "body": body,
            "enabled": bool(item.get("enabled")),
        })
    return cleaned or copy.deepcopy(DEFAULT_SKILLS)


async def load_settings(user_id: str) -> dict[str, Any]:
    key = _key(user_id)
    client = await get_redis()
    raw = None
    if client is not None:
        try:
            blob = await cache_get(key)
            if blob:
                raw = json.loads(blob)
        except Exception:
            raw = None
    if raw is None:
        raw = _memory.get(key)
    if not raw:
        return default_settings()
    return _decrypt_secrets(raw)


async def save_settings(user_id: str, patch: dict[str, Any]) -> dict[str, Any]:
    current = await load_settings(user_id)
    if "caveman" in patch:
        current["caveman"] = bool(patch["caveman"])
    if "skills" in patch:
        current["skills"] = _merge_skills(patch.get("skills"))
    mcp_patch = patch.get("mcp") or {}
    mcp = current.setdefault("mcp", default_settings()["mcp"])
    if "knowledge" in mcp_patch:
        mcp["knowledge"] = bool(mcp_patch["knowledge"])
    if "notion" in mcp_patch:
        n = mcp.setdefault("notion", {})
        n["enabled"] = bool(mcp_patch["notion"].get("enabled", n.get("enabled")))
        token = mcp_patch["notion"].get("token")
        if token:
            n["token"] = token
        elif mcp_patch["notion"].get("clear"):
            n["token"] = ""
            n["enabled"] = False
    if "obsidian" in mcp_patch:
        o = mcp.setdefault("obsidian", {})
        o["enabled"] = bool(mcp_patch["obsidian"].get("enabled", o.get("enabled")))
        if mcp_patch["obsidian"].get("base_url"):
            o["base_url"] = str(mcp_patch["obsidian"]["base_url"]).rstrip("/")
        key = mcp_patch["obsidian"].get("api_key")
        if key:
            o["api_key"] = key
        elif mcp_patch["obsidian"].get("clear"):
            o["api_key"] = ""
            o["enabled"] = False
    stored = _encrypt_secrets(current)
    redis_key = _key(user_id)
    _memory[redis_key] = stored
    await cache_set(redis_key, json.dumps(stored), _TTL)
    return current


def enabled_skill_bodies(
    settings: dict[str, Any],
    skill_ids: Optional[list[str]] = None,
    extra_bodies: Optional[list[str]] = None,
) -> list[str]:
    extras = [body.strip() for body in extra_bodies or [] if body and body.strip()]
    if extras:
        return extras[:8]
    skills = settings.get("skills") or []
    if skill_ids:
        wanted = set(skill_ids)
        return [s["body"] for s in skills if s.get("id") in wanted and s.get("body")][:8]
    return [s["body"] for s in skills if s.get("enabled") and s.get("body")][:8]


def mcp_creds(settings: dict[str, Any]) -> dict[str, Any]:
    mcp = settings.get("mcp") or {}
    notion = mcp.get("notion") or {}
    obsidian = mcp.get("obsidian") or {}
    return {
        "knowledge": bool(mcp.get("knowledge", True)),
        "notion_token": notion.get("token") if notion.get("enabled") else None,
        "obsidian_url": obsidian.get("base_url") if obsidian.get("enabled") else None,
        "obsidian_key": obsidian.get("api_key") if obsidian.get("enabled") else None,
    }
