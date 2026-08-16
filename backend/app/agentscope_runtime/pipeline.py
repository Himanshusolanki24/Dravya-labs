"""Sequential pipeline compatible with AgentScope `pipeline.sequential_pipeline`."""

from __future__ import annotations

from typing import Any, Callable, Optional

try:
    from agentscope.pipeline import sequential_pipeline as agentscope_sequential
except Exception:  # pragma: no cover - optional dependency shape
    agentscope_sequential = None

try:
    from agentscope.message import Msg
except Exception:  # pragma: no cover
    Msg = None


def make_msg(name: str, content: str, role: str = "user") -> Any:
    if Msg is not None:
        try:
            return Msg(name, content, role)
        except TypeError:
            try:
                return Msg(name=name, content=content, role=role)
            except TypeError:
                pass
    return {"name": name, "content": content, "role": role}


def msg_text(msg: Any) -> str:
    if msg is None:
        return ""
    if isinstance(msg, str):
        return msg
    if isinstance(msg, dict):
        return str(msg.get("content") or "")
    content = getattr(msg, "content", None)
    if isinstance(content, str):
        return content
    return str(msg)


async def sequential_pipeline(agents: list[Callable], msg: Any = None) -> Any:
    """Run agents in order. Prefer AgentScope's implementation when it accepts this shape."""
    if agentscope_sequential is not None:
        try:
            return await agentscope_sequential(agents=agents, msg=msg)
        except TypeError:
            try:
                return await agentscope_sequential(agents, msg)
            except Exception:
                pass
        except Exception:
            pass
    current = msg
    for agent in agents:
        current = await agent(current)
    return current
