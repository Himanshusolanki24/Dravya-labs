from app.services.embeddings import embed_text
from app.services.pinecone_service import index


def retrieve_knowledge(query: str, top_k: int = 5) -> list[str]:
    """
    Searches Pinecone for relevant Ayurvedic knowledge chunks.
    Returns list of text snippets.
    """
    embedding = embed_text(query)

    results = index.query(
        vector=embedding,
        top_k=top_k,
        include_metadata=True
    )

    matches = results.get("matches", [])

    knowledge_chunks = []
    for match in matches:
        metadata = match.get("metadata", {})
        text = metadata.get("text")

        if text:
            knowledge_chunks.append(text)

    return knowledge_chunks
