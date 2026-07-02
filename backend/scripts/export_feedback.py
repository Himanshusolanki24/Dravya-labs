"""
RLHF export — the long-term half of the Data Flywheel.

Run weekly. Produces JSONL training data from highly-rated conversations:

    python -m scripts.export_feedback --min-score 1 --out ./training_data

Two outputs:
  • llm_sft_<date>.jsonl   → chat pairs to fine-tune a cheap open model
                             (e.g. Llama 3.1 8B / Mistral 7B via LoRA).
  • ml_penalties_<date>.csv → 👎 rows grouped by dosha/condition, to add as
                             negative examples when re-training the ML models.

This uses the same async Supabase helper as the app, so no extra DB driver
is needed.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import json
import os
from collections import Counter
from datetime import datetime

from app.services.supabase_async import select_rows, close_client


async def _fetch(min_score: int, limit: int) -> list[dict]:
    op = "gte" if min_score >= 0 else "lte"
    return await select_rows(
        "feedback",
        filters={"feedback_score": f"{op}.{min_score}"},
        select="user_prompt,ai_response,feedback_score,feedback_text,dosha_context",
        order="created_at.desc",
        limit=limit,
    )


async def main(min_score: int, out_dir: str, limit: int) -> None:
    os.makedirs(out_dir, exist_ok=True)
    date = datetime.utcnow().date()

    # --- Positive pairs → LLM supervised fine-tuning ---
    good = await _fetch(min_score=1, limit=limit)
    sft_path = os.path.join(out_dir, f"llm_sft_{date}.jsonl")
    with open(sft_path, "w", encoding="utf-8") as f:
        for r in good:
            if r.get("feedback_text"):
                continue  # skip answers the user had to correct
            f.write(json.dumps({
                "messages": [
                    {"role": "user", "content": r["user_prompt"]},
                    {"role": "assistant", "content": r["ai_response"]},
                ]
            }) + "\n")
    print(f"[LLM]  wrote {len(good)} positive pairs → {sft_path}")

    # --- Negative signals → ML model penalties ---
    bad = await _fetch(min_score=-1, limit=limit)
    bad = [r for r in bad if r.get("feedback_score") == -1]
    penalty_path = os.path.join(out_dir, f"ml_penalties_{date}.csv")
    counter: Counter = Counter()
    with open(penalty_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["dominant_dosha", "condition", "correction"])
        for r in bad:
            ctx = r.get("dosha_context") or {}
            dosha = ctx.get("dominant_dosha", "unknown")
            cond = ctx.get("primary_condition", "unknown")
            counter[(dosha, cond)] += 1
            w.writerow([dosha, cond, r.get("feedback_text") or ""])
    print(f"[ML]   wrote {len(bad)} penalty rows → {penalty_path}")
    if counter:
        print("       top downvoted (dosha, condition):",
              counter.most_common(5))

    await close_client()


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--min-score", type=int, default=1)
    p.add_argument("--out", default="./training_data")
    p.add_argument("--limit", type=int, default=10000)
    args = p.parse_args()
    asyncio.run(main(args.min_score, args.out, args.limit))
