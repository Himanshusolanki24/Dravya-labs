from typing import Any, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import verify_user
from app.services import chat_settings

router = APIRouter(prefix="/api/chat", tags=["chat-tools"])


class ChatToolsPatch(BaseModel):
    caveman: Optional[bool] = None
    skills: Optional[list[dict[str, Any]]] = None
    mcp: Optional[dict[str, Any]] = None


@router.get("/tools")
async def get_chat_tools(user_id: str = Depends(verify_user)):
    data = await chat_settings.load_settings(user_id)
    return chat_settings.public_view(data)


@router.put("/tools")
async def put_chat_tools(payload: ChatToolsPatch, user_id: str = Depends(verify_user)):
    data = await chat_settings.save_settings(user_id, payload.model_dump(exclude_none=True))
    return chat_settings.public_view(data)
