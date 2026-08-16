"""
Dynamic Few-Shot Prompting — the short-term half of the Data Flywheel.

When a new user asks something, we pull a few PAST answers that earned a
👍 (feedback_score = 1) for the SAME dosha, and inject them into the
orchestrator prompt as "here is how to answer well" examples.

This improves quality on day one — no model training required. The same
data later feeds the long-term RLHF export.

Usage (in orchestrator_agent.node_synthesize, before call_llm):

    from app.services.few_shot_retriever import get_few_shot_examples
    examples = await get_few_shot_examples(user_msg, dominant_dosha)
    system_prompt = ORCHESTRATOR_PROMPT + examples
"""

from __future__ import annotations

import logging

from app.services.supabase_async import select_rows

logger = logging.getLogger("dravya.few_shot")


async def get_few_shot_examples(
    user_prompt: str,
    dosha: str,
    top_k: int = 3,
) -> str:
    """
    Return a formatted few-shot block of highly-rated past answers for `dosha`.
    Returns "" when there is nothing good to show yet (safe no-op).
    """
    if not dosha:
        return ""

    try:
        rows = await select_rows(
            "feedback",
            filters={
                "feedback_score": "eq.1",
                "dosha_context->>dominant_dosha": f"eq.{dosha}",
            },
            select="user_prompt,ai_response",
            order="created_at.desc",
            limit=top_k,
        )
    except Exception as e:
        logger.warning("Few-shot retrieval failed (non-fatal): %s", e)
        return ""

    if not rows:
        return ""

    blocks = [
        f"Example Question: {r.get('user_prompt', '')}\n"
        f"Example Answer: {r.get('ai_response', '')}"
        for r in rows
    ]

    logger.info("Injected %d few-shot examples for dosha=%s", len(blocks), dosha)
    formatted = (
        "\n\n--- HIGHLY-RATED PAST ANSWERS (match this quality & style) ---\n"
        + "\n\n".join(blocks)
    )
    try:
        from app.agentscope_runtime.knowledge import get_knowledge_registry

        texts = [f"{r.get('user_prompt', '')}\n{r.get('ai_response', '')}" for r in rows]
        await get_knowledge_registry().feedback_fewshot.add_documents(
            texts,
            metadata={"dosha": dosha, "type": "fewshot"},
        )
        kb_hits = await get_knowledge_registry().feedback_fewshot.retrieve(
            user_prompt or dosha, top_k=top_k, extra_filter={"dosha": dosha}
        )
        extra = [hit.text for hit in kb_hits if hit.text]
        if extra:
            formatted += "\n\n--- KNOWLEDGE BASE FEW-SHOT ---\n" + "\n\n".join(extra[:top_k])
    except Exception as e:
        logger.warning("Few-shot KB index/search failed (non-fatal): %s", e)
    return formatted
