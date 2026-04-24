def build_rag_context(user_summary: str, knowledge_chunks: list[str]) -> str:
    """
    Combines user health summary with retrieved Ayurvedic knowledge.
    """

    knowledge_section = "\n\n".join(
        [f"- {chunk}" for chunk in knowledge_chunks]
    )

    context = f"""
USER HEALTH SUMMARY:
{user_summary}

RELEVANT AYURVEDIC KNOWLEDGE:
{knowledge_section}

Use this knowledge to provide safe, educational wellness guidance.
Do NOT diagnose diseases. Do NOT prescribe medicines.
"""

    return context.strip()
