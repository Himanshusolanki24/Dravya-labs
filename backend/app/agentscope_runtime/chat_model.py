"""AgentScope ChatModel wrapper over the league-aware LLM client."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from agents.llm_client import LLMResult, invoke_llm
from app.core.config import settings


@dataclass
class ChatResponse:
    text: str
    model_used: str
    league_used: Optional[str] = None
    league_requested: Optional[str] = None
    downgraded: bool = False
    prompt_tokens: int = 0
    completion_tokens: int = 0


class DravyaChatModel:
    """Thin async chat model used by Vaidya/Safety/chat/treatment agents."""

    def __init__(
        self,
        model: Optional[str] = None,
        *,
        league: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> None:
        self.model = model or settings.MODEL_NAME
        self.league = league
        self.user_id = user_id

    async def __call__(
        self,
        system_prompt: str,
        user_message: str,
        *,
        temperature: float = 0.4,
        max_tokens: int = 2048,
        model: Optional[str] = None,
        league: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> ChatResponse:
        result: LLMResult = await invoke_llm(
            system_prompt,
            user_message,
            model=model or (None if (league or self.league) else self.model),
            league=league or self.league,
            user_id=user_id or self.user_id,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return ChatResponse(
            text=result.text,
            model_used=result.model_id,
            league_used=result.league,
            league_requested=result.league_requested,
            downgraded=result.downgraded,
            prompt_tokens=result.prompt_tokens,
            completion_tokens=result.completion_tokens,
        )
