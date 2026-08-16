"""
LLM Client — multi-provider HTTP gateway (no vendor SDKs).

Supports OpenAI, Anthropic, Mistral, Groq, xAI, Gemini, DeepSeek, and OpenRouter.
Calls use explicit `provider:model` ids. Bare model names still work for older
callers via a small legacy heuristic.

`call_llm_text` remains a string-returning API. Prefer `invoke_llm` when you
need token usage. League routing lives in `agents.llm_leagues`.
"""

from __future__ import annotations

import json
import logging
import re
import hashlib
from dataclasses import dataclass
from typing import Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings
from app.services.redis_cache import cache_get, cache_set

logger = logging.getLogger("dravya.llm")

_RETRYABLE = (httpx.TimeoutException, httpx.ConnectError, httpx.ReadTimeout)
CACHE_TTL_SECONDS = 3600

_client: Optional[httpx.AsyncClient] = None

OPENAI_COMPAT = {
    "openai": ("https://api.openai.com/v1/chat/completions", lambda: settings.OPENAI_API_KEY),
    "mistral": ("https://api.mistral.ai/v1/chat/completions", lambda: settings.MISTRAL_API_KEY),
    "groq": ("https://api.groq.com/openai/v1/chat/completions", lambda: settings.GROQ_API_KEY),
    "xai": ("https://api.x.ai/v1/chat/completions", lambda: settings.XAI_API_KEY),
    "google": (
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        lambda: settings.GEMINI_API_KEY,
    ),
    "deepseek": ("https://api.deepseek.com/chat/completions", lambda: settings.DEEPSEEK_API_KEY),
    "openrouter": ("https://openrouter.ai/api/v1/chat/completions", lambda: settings.OPENROUTER_API_KEY),
}


@dataclass
class LLMResult:
    text: str
    provider: str
    model: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    league: Optional[str] = None
    league_requested: Optional[str] = None
    downgraded: bool = False

    @property
    def total_tokens(self) -> int:
        return self.prompt_tokens + self.completion_tokens

    @property
    def model_id(self) -> str:
        return f"{self.provider}:{self.model}"


def parse_model_id(spec: Optional[str]) -> tuple[str, str]:
    """Split `provider:model` or apply a legacy name heuristic."""
    raw = (spec or settings.MODEL_NAME or "mistral-small-latest").strip()
    if ":" in raw:
        provider, model = raw.split(":", 1)
        return provider.strip().lower(), model.strip()
    lower = raw.lower()
    if lower.startswith(("gpt", "o1", "o3", "o4")):
        return "openai", raw
    if lower.startswith("claude"):
        return "anthropic", raw
    if lower.startswith("grok"):
        return "xai", raw
    if lower.startswith("gemini"):
        return "google", raw
    if lower.startswith("deepseek"):
        return "deepseek", raw
    if lower.startswith("llama") or "saba" in lower:
        return "groq", raw
    if "/" in raw:
        return "openrouter", raw
    return "mistral", raw


def provider_key(provider: str) -> str:
    return {
        "openai": settings.OPENAI_API_KEY or "",
        "anthropic": settings.ANTHROPIC_API_KEY or "",
        "mistral": settings.MISTRAL_API_KEY or "",
        "groq": settings.GROQ_API_KEY or "",
        "xai": settings.XAI_API_KEY or "",
        "google": settings.GEMINI_API_KEY or "",
        "deepseek": settings.DEEPSEEK_API_KEY or "",
        "openrouter": settings.OPENROUTER_API_KEY or "",
    }.get(provider, "")


def provider_available(spec: str) -> bool:
    provider, _model = parse_model_id(spec)
    return bool(provider_key(provider))


def estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4) if text else 0


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


def _usage_from_payload(data: dict, system_prompt: str, user_message: str, result_text: str) -> tuple[int, int]:
    usage = data.get("usage") or {}
    prompt = usage.get("prompt_tokens") or usage.get("input_tokens")
    completion = usage.get("completion_tokens") or usage.get("output_tokens")
    if prompt is None:
        prompt = estimate_tokens(system_prompt) + estimate_tokens(user_message)
    if completion is None:
        completion = estimate_tokens(result_text)
    return int(prompt), int(completion)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(_RETRYABLE),
    reraise=True,
)
async def invoke_provider(
    provider: str,
    model: str,
    system_prompt: str,
    user_message: str,
    *,
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> LLMResult:
    """Call one provider with no fallback. Raises on HTTP/auth errors."""
    key = provider_key(provider)
    if not key:
        raise RuntimeError(f"No API key configured for provider '{provider}'")

    client = _get_client()

    if provider == "anthropic":
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "system": system_prompt,
                "messages": [{"role": "user", "content": user_message}],
            },
        )
        resp.raise_for_status()
        data = resp.json()
        result_text = "".join(block.get("text", "") for block in data.get("content", []))
        prompt_tokens, completion_tokens = _usage_from_payload(data, system_prompt, user_message, result_text)
        return LLMResult(
            text=result_text,
            provider=provider,
            model=model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
        )

    if provider not in OPENAI_COMPAT:
        raise RuntimeError(f"Unknown LLM provider '{provider}'")

    url, _ = OPENAI_COMPAT[provider]
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {key}"}
    if provider == "openrouter":
        headers["HTTP-Referer"] = "https://dravya.health"
        headers["X-Title"] = "Dravya Labs"
    resp = await client.post(
        url,
        headers=headers,
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        },
    )
    resp.raise_for_status()
    data = resp.json()
    result_text = data["choices"][0]["message"]["content"] or ""
    prompt_tokens, completion_tokens = _usage_from_payload(data, system_prompt, user_message, result_text)
    return LLMResult(
        text=result_text,
        provider=provider,
        model=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
    )


def _resolve(model: Optional[str]) -> tuple[str, str]:
    """Legacy resolver used when callers pass a bare model name without a league."""
    provider, name = parse_model_id(model)
    if provider_key(provider):
        return provider, name
    if provider_key("mistral"):
        logger.warning("%s key missing — falling back to Mistral for %s", provider, name)
        return "mistral", settings.MODEL_NAME or "mistral-small-latest"
    if provider_key("groq"):
        return "groq", "llama-3.3-70b-versatile"
    if provider_key("openrouter"):
        return "openrouter", name if "/" in name else f"mistralai/{name}"
    raise RuntimeError("No LLM provider API key is configured")


async def invoke_llm(
    system_prompt: str,
    user_message: str,
    *,
    model: Optional[str] = None,
    league: Optional[str] = None,
    user_id: Optional[str] = None,
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> LLMResult:
    if league or user_id:
        from agents.llm_leagues import resolve_call

        return await resolve_call(
            system_prompt,
            user_message,
            requested_league=league,
            user_id=user_id,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    provider, name = _resolve(model)
    cache_key = "llm:" + hashlib.md5(
        f"{provider}:{name}:{temperature}:{system_prompt}:{user_message}".encode()
    ).hexdigest()
    cached_val = await cache_get(cache_key)
    if cached_val is not None:
        return LLMResult(text=cached_val, provider=provider, model=name)

    result = await invoke_provider(
        provider, name, system_prompt, user_message,
        temperature=temperature, max_tokens=max_tokens,
    )
    await cache_set(cache_key, result.text, CACHE_TTL_SECONDS)
    return result


async def call_llm_text(
    system_prompt: str,
    user_message: str,
    *,
    model: Optional[str] = None,
    league: Optional[str] = None,
    user_id: Optional[str] = None,
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> str:
    result = await invoke_llm(
        system_prompt,
        user_message,
        model=model,
        league=league,
        user_id=user_id,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return result.text


async def call_llm(
    system_prompt: str,
    user_message: str,
    *,
    model: Optional[str] = None,
    league: Optional[str] = None,
    user_id: Optional[str] = None,
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> dict:
    text = await call_llm_text(
        system_prompt, user_message,
        model=model, league=league, user_id=user_id,
        temperature=temperature, max_tokens=max_tokens,
    )
    return _parse_json(text)


def _parse_json(text: str) -> dict:
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
