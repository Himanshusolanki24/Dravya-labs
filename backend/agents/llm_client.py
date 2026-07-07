"""
LLM Client — lightweight multi-provider wrapper (pure httpx, no SDKs).

Supports Mistral, OpenAI, and Anthropic through raw HTTP so we add no heavy
dependencies. Provider is inferred from the model name. If a model's provider
key is not configured, the call gracefully falls back to Mistral — so the app
runs on Mistral alone and "lights up" the other tiers as you add keys.

Two public functions:
  • call_llm(...)       → returns parsed JSON dict   (backward-compatible; agents use this)
  • call_llm_text(...)  → returns raw string         (router / judge / free-form)

A single shared httpx.AsyncClient is reused for connection pooling (keep-alive),
instead of opening a new TCP+TLS connection on every call.
"""

from __future__ import annotations

import json
import logging
import re
import hashlib
from typing import Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings
from app.services.redis_cache import cache_get, cache_set

logger = logging.getLogger("dravya.llm")

_RETRYABLE = (httpx.TimeoutException, httpx.ConnectError, httpx.ReadTimeout)

CACHE_TTL_SECONDS = 3600

# ── Shared, pooled client ────────────────────────────────────
_client: Optional[httpx.AsyncClient] = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            timeout=60.0,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
        )
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


# ── Provider routing ─────────────────────────────────────────
def _provider_for(model: str) -> str:
    m = model.lower()
    if m.startswith(("gpt", "o1", "o3", "o4")):
        return "openai"
    if m.startswith("claude"):
        return "anthropic"
    return "mistral"


def _resolve(model: Optional[str]) -> tuple[str, str]:
    """
    Return (provider, model), falling back to Mistral if the requested
    provider has no API key configured.
    """
    model = model or settings.MODEL_NAME
    provider = _provider_for(model)

    if provider == "openai" and not settings.OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY missing — falling back to Mistral for %s", model)
        provider, model = "mistral", settings.MODEL_NAME
    elif provider == "anthropic" and not settings.ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY missing — falling back to Mistral for %s", model)
        provider, model = "mistral", settings.MODEL_NAME

    if provider == "mistral" and not settings.MISTRAL_API_KEY:
        raise RuntimeError("MISTRAL_API_KEY must be set in .env")

    return provider, model


def provider_available(model: str) -> bool:
    """True if the model's provider has a key configured (used by the ensemble)."""
    provider = _provider_for(model)
    return {
        "mistral": bool(settings.MISTRAL_API_KEY),
        "openai": bool(settings.OPENAI_API_KEY),
        "anthropic": bool(settings.ANTHROPIC_API_KEY),
    }.get(provider, False)


# ── Core request ─────────────────────────────────────────────
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(_RETRYABLE),
    reraise=True,
)
async def call_llm_text(
    system_prompt: str,
    user_message: str,
    *,
    model: Optional[str] = None,
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> str:
    """Call the resolved provider and return the raw text content."""
    provider, model = _resolve(model)
    
    # Check Redis Cache
    cache_key = "llm:" + hashlib.md5(f"{provider}:{model}:{temperature}:{system_prompt}:{user_message}".encode()).hexdigest()
    cached_val = await cache_get(cache_key)
    if cached_val is not None:
        logger.info("Serving LLM response from Redis cache (key=%s)", cache_key)
        return cached_val

    client = _get_client()

    if provider == "anthropic":
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        body = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_message}],
        }
        resp = await client.post(url, json=body, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        result_text = "".join(block.get("text", "") for block in data.get("content", []))
        await cache_set(cache_key, result_text, CACHE_TTL_SECONDS)
        return result_text

    # OpenAI + Mistral share the chat-completions shape
    if provider == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        key = settings.OPENAI_API_KEY
    else:
        url = "https://api.mistral.ai/v1/chat/completions"
        key = settings.MISTRAL_API_KEY

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {key}"}
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    resp = await client.post(url, json=body, headers=headers)
    resp.raise_for_status()

    data = resp.json()
    result_text = data["choices"][0]["message"]["content"]
    await cache_set(cache_key, result_text, CACHE_TTL_SECONDS)
    return result_text


async def call_llm(
    system_prompt: str,
    user_message: str,
    *,
    model: Optional[str] = None,
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> dict:
    """
    Backward-compatible entry point used by all agents.
    Returns the parsed JSON object from the model's response.
    """
    text = await call_llm_text(
        system_prompt, user_message,
        model=model, temperature=temperature, max_tokens=max_tokens,
    )
    return _parse_json(text)


def _parse_json(text: str) -> dict:
    """Best-effort extraction of a JSON object from an LLM response."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    fence = re.search(r"```(?:json)?\s*\n?(.*?)```", text, re.S)
    if fence:
        try:
            return json.loads(fence.group(1))
        except json.JSONDecodeError:
            pass

    brace = re.search(r"\{.*\}", text, re.S)
    if brace:
        try:
            return json.loads(brace.group(0))
        except json.JSONDecodeError:
            pass

    logger.warning("LLM response was not valid JSON, returning raw text.")
    return {"raw_response": text}
