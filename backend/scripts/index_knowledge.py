"""Index markdown/CSV files under backend/knowledge into the classical KB."""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.agentscope_runtime.knowledge import get_knowledge_registry


def chunk_text(text: str, max_chars: int = 800) -> list[str]:
    paragraphs = [part.strip() for part in text.replace("\r\n", "\n").split("\n\n") if part.strip()]
    chunks: list[str] = []
    current = ""
    for paragraph in paragraphs:
        if paragraph.startswith("#"):
            paragraph = paragraph.lstrip("#").strip()
        if len(current) + len(paragraph) + 2 > max_chars and current:
            chunks.append(current.strip())
            current = paragraph
        else:
            current = f"{current}\n\n{paragraph}".strip()
    if current:
        chunks.append(current.strip())
    return chunks or ([text.strip()] if text.strip() else [])


async def index_directory(directory: Path) -> int:
    registry = get_knowledge_registry()
    files = sorted(list(directory.glob("*.md")) + list(directory.glob("*.txt")) + list(directory.glob("*.csv")))
    total = 0
    for path in files:
        text = path.read_text(encoding="utf-8")
        chunks = chunk_text(text)
        if not chunks:
            continue
        await registry.classical.add_documents(
            chunks,
            document_id=path.stem,
            metadata={"source": path.name, "kb": "ayurveda_classical"},
        )
        total += len(chunks)
        print(f"Indexed {path.name}: {len(chunks)} chunks")
    return total


async def main() -> None:
    parser = argparse.ArgumentParser(description="Index classical Ayurveda knowledge")
    parser.add_argument("--dir", default=str(ROOT / "knowledge"))
    args = parser.parse_args()
    directory = Path(args.dir)
    if not directory.exists():
        raise SystemExit(f"Knowledge directory not found: {directory}")
    count = await index_directory(directory)
    print(f"Done. {count} chunks in ayurveda_classical.")


if __name__ == "__main__":
    asyncio.run(main())
