"""AgentScope library-mode runtime: knowledge bases, embeddings, and pipelines."""

from app.agentscope_runtime.knowledge import KnowledgeRegistry, get_knowledge_registry
from app.agentscope_runtime.rag import retrieve_knowledge, retrieve_knowledge_blocks

__all__ = [
    "KnowledgeRegistry",
    "get_knowledge_registry",
    "retrieve_knowledge",
    "retrieve_knowledge_blocks",
]
