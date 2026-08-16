from typing import Optional

from app.mcp.caveman import compose_system, max_tokens_for
from app.mcp.providers import gather_mcp_context
from app.services import chat_settings


async def resolve_prompt(
    user_id: str,
    message: str,
    *,
    profile_context: str,
    rag: str,
    caveman: Optional[bool] = None,
    skill_ids: Optional[list[str]] = None,
    extra_skills: Optional[list[str]] = None,
) -> tuple[str, bool, int]:
    stored = await chat_settings.load_settings(user_id)
    use_caveman = stored.get("caveman", False) if caveman is None else bool(caveman)
    bodies = chat_settings.enabled_skill_bodies(stored, skill_ids, extra_skills)
    creds = chat_settings.mcp_creds(stored)
    mcp_context = await gather_mcp_context(message, **creds)
    system = compose_system(
        caveman=use_caveman,
        skill_bodies=bodies,
        profile_context=profile_context,
        mcp_context=mcp_context,
        rag=rag,
    )
    return system, use_caveman, max_tokens_for(use_caveman)
