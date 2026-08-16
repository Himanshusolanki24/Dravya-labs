"""Compressed 'caveman' prompt style — fewer tokens in and out."""

CAVEMAN_SYSTEM = (
    "CAVEMAN MODE. Compress. Drop articles, greetings, filler. "
    "Short clauses. Bullet facts. Safety first. Not a doctor. "
    "Cap ~80 words unless user asks more. Keep herb cautions."
)

NORMAL_SYSTEM = (
    "You are a helpful Ayurvedic wellness assistant for Dravya Health. "
    "Provide brief, safety-first, personalized answers. "
    "Always recommend consulting a healthcare professional for serious concerns."
)


def compose_system(
    *,
    caveman: bool,
    skill_bodies: list[str],
    profile_context: str,
    mcp_context: str,
    rag: str,
) -> str:
    parts = [CAVEMAN_SYSTEM if caveman else NORMAL_SYSTEM]
    from app.openui import OPENUI_INSTRUCTIONS
    parts.append(OPENUI_INSTRUCTIONS)
    if skill_bodies:
        joined = "\n\n".join(body.strip() for body in skill_bodies if body and body.strip())
        if joined:
            parts.append("USER SKILLS (follow these):\n" + joined[:4000])
    if profile_context:
        profile = profile_context if not caveman else profile_context[:900]
        parts.append("PROFILE:\n" + profile)
    if mcp_context:
        parts.append("CONNECTED NOTES:\n" + mcp_context)
    if rag:
        parts.append(rag if not caveman else rag[:1200])
    return "\n\n".join(parts)


def max_tokens_for(caveman: bool) -> int:
    return 512 if caveman else 2048
