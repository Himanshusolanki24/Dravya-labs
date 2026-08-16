from app.agentscope_runtime.rag import retrieve_knowledge as _retrieve


def retrieve_knowledge(query: str, top_k: int = 5) -> list[str]:
    """Synchronous wrapper kept for older callers; prefer the async RAG helper."""
    import asyncio

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
    if loop and loop.is_running():
        return []
    return asyncio.run(_retrieve(query, top_k=top_k))
