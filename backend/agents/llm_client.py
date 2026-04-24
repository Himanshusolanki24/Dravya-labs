"""
LLM Client — Async wrapper around Mistral API.

All agents use this to call the LLM with structured prompts.
Includes retry logic, JSON parsing, and error handling.
"""

import json
import logging
import re

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings

logger = logging.getLogger("dravya.llm")

# ── Retry-able exceptions ────────────────────────────────────
_RETRYABLE = (httpx.TimeoutException, httpx.ConnectError, httpx.ReadTimeout)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(_RETRYABLE),
    reraise=True,
)
async def call_llm(
    system_prompt: str,
    user_message: str,
    *,
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> dict:
    """
    Call Mistral API and return the parsed JSON response.

    The system prompt should instruct the model to reply in JSON.
    If the model returns non-JSON, a best-effort extraction is attempted.
    """
    api_key = settings.MISTRAL_API_KEY

    if not api_key:
        raise RuntimeError(
            "MISTRAL_API_KEY must be set in .env"
        )

    # Direct Mistral API chat completions
    url = "https://api.mistral.ai/v1/chat/completions"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    body = {
        "model": settings.MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, json=body, headers=headers)
        resp.raise_for_status()

    data = resp.json()
    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )

    return _parse_json(content)


def _parse_json(text: str) -> dict:
    """
    Try to extract a JSON object from the LLM response.
    Handles markdown code fences, leading prose, etc.
    """
    # 1. Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Try extracting from ```json ... ``` block
    fence = re.search(r"```(?:json)?\s*\n?(.*?)```", text, re.S)
    if fence:
        try:
            return json.loads(fence.group(1))
        except json.JSONDecodeError:
            pass

    # 3. Find first { … } block
    brace = re.search(r"\{.*\}", text, re.S)
    if brace:
        try:
            return json.loads(brace.group(0))
        except json.JSONDecodeError:
            pass

    # 4. Give up — return raw text wrapped
    logger.warning("LLM response was not valid JSON, returning raw text.")
    return {"raw_response": text}
