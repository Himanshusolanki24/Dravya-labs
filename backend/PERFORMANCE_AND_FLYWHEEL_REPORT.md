# Dravya Labs — Backend Performance Analysis, Data Flywheel & Lightweight ML Stack

> **Date:** 2026-07-03
> **Scope:** Full backend analysis → what is making it slow → Data Flywheel (RLHF) feature → PyTorch replacement
> **Verified against actual source** (line numbers are real, not estimates)

---

## Contents

1. [TL;DR](#1-tldr)
2. [What is actually slowing the backend](#2-what-is-actually-slowing-the-backend)
3. [A real bug found during analysis](#3-a-real-bug-found-during-analysis)
4. [The Data Flywheel — what was added](#4-the-data-flywheel--what-was-added)
5. [Replacing PyTorch with a lightweight stack](#5-replacing-pytorch-with-a-lightweight-stack)
6. [Prioritized action list](#6-prioritized-action-list)

---

## 1. TL;DR

The backend is slow for **four structural reasons**, in order of impact:

1. **6 LLM calls run one after another** in a single request (15–30 s of the latency is just waiting on Mistral, in series).
2. **The whole pipeline blocks the HTTP worker** — nothing runs in the background.
3. **Synchronous `requests` calls sit inside async handlers** — one DB call freezes *all* concurrent users.
4. **Every external call opens a brand-new TCP+TLS connection** — no pooling, no keep-alive.

Everything else (no cache, heavy PyTorch containers, no rate limiting) adds to it, but those four are the reason a request takes tens of seconds.

The **Data Flywheel** (👍/👎 → few-shot → RLHF) has been scaffolded into the backend — see Section 4 for the files created.

For **PyTorch**: your models are tiny tabular MLPs (diabetes = 8 inputs, brahma = 29 inputs → dosha). Gradient-boosted trees (**LightGBM**) are smaller, faster, and usually *more* accurate on this kind of data. The one real image model (skin) should be exported to **ONNX Runtime**. See Section 5.

---

## 2. What is actually slowing the backend

### 2.1 🔴 Six LLM calls, in series (the #1 cost)

The LangGraph pipeline is a straight line, and almost every node makes its own blocking LLM call:

`memory_retrieve → symptoms → prakriti → vikriti → dravya → ahara → safety → synthesize → memory_save`
— [`agents/orchestrator_agent.py:244-253`](agents/orchestrator_agent.py#L244-L253)

That is **6 sequential Mistral calls** (prakriti, vikriti, dravya, ahara, safety, synthesize), each a full network round-trip of 2–5 s. They run one after another because each node is wired to the next with `add_edge`.

**Fix:** the independent analyses don't need to be sequential.
- `prakriti` and `vikriti` can run **concurrently** (`asyncio.gather`).
- `dravya` (herbs) and `ahara` (diet) can run **concurrently**.
- `safety` can be **rule-based** (no LLM — see 5.3), removing a whole call.
- That collapses 6 serial calls → ~2 serial "waves" + 1 synthesis ≈ **3 round-trips instead of 6**, roughly halving wall-clock time before any other change.

### 2.2 🔴 The pipeline blocks the HTTP request

```python
# main.py:228  (inside the request handler)
result = await run_pipeline(initial_state)   # 15–30 s, holds the worker the whole time
```
The frontend compensates with a 3-minute timeout ([`frontend/config/api.ts`](../frontend/config/api.ts) `AI_TIMEOUT: 180000`), which is treating the symptom. With 4 uvicorn workers, ~4 users in flight saturate the server.

**Fix:** run the pipeline as a background job (FastAPI `BackgroundTasks` for a quick win, Celery/Redis later) and return a job id the frontend polls or streams (SSE). Response drops from ~20 s to ~200 ms; the heavy work finishes out-of-band.

### 2.3 🔴 Synchronous `requests` inside async handlers

```python
# app/services/supabase.py:1,13,18
import requests
response = requests.post(url, json=data, headers=headers)   # BLOCKS the event loop
response = requests.get(url, headers=headers)               # BLOCKS the event loop
```
`requests` is synchronous. Inside an `async def` handler it freezes the **entire** event loop until Supabase replies — so every concurrent request pauses on one user's DB call. `_fetch_user_profile()` uses this on **every** analyze/chat/treatment call ([`main.py:119, 311, 479, 538`](main.py#L119)).

**Fix:** use the async, pooled client added in this change → [`app/services/supabase_async.py`](app/services/supabase_async.py). Migrate routes off the sync module.

### 2.4 🟠 A new connection per external call (no pooling)

```python
# agents/llm_client.py:67   — new client every LLM call
async with httpx.AsyncClient(timeout=60) as client: ...
# model_clients/base_client.py:79   — new client every ML prediction
async with httpx.AsyncClient(timeout=self.timeout) as client: ...
```
The symptoms stage fires 8 ML calls ([`agents/symptoms_agent.py:59-68`](agents/symptoms_agent.py#L59-L68)); with retries that is ~16 fresh TCP+TLS handshakes **per request**. A shared `httpx.AsyncClient` reuses connections (keep-alive) and removes that handshake tax entirely.

**Fix:** one module-level `AsyncClient` per outbound target (done for Supabase in `supabase_async.py`; apply the same to `llm_client.py` and `base_client.py`).

> ⚠️ Bonus bug in `llm_client.py`: `resp.json()` is read on **line 71, after** the `async with` block closes on line 69. It works today only because the body is already buffered — move it inside the `with` before you rely on streaming.

### 2.5 🟠 Zero caching

`_fetch_user_profile()` re-reads Supabase on every request; the 8 ML models and the LLM are re-invoked for identical inputs. Cache hit rate is **0%**.

**Fix:** Redis (or even in-process `cachetools`) keyed on `user_id` for the profile, and on a hash of the ML questionnaire for model outputs. Profiles rarely change between messages in a session — this is nearly free latency.

### 2.6 🟡 Heavy dependencies inflate cold start & memory

Each ML microservice pulls in **`torch` (~2 GB installed)** plus `pandas`, `numpy`, `scikit-learn` (see every `*/requirements.txt`). The backend itself loads `sentence-transformers` ([`config.py:38`](app/core/config.py#L38)), another large model download. This makes containers slow to boot, memory-hungry, and expensive to scale horizontally. Section 5 fixes this.

### 2.7 🟡 Secondary issues (correctness/ops, not raw latency)

| Issue | Evidence |
|---|---|
| Encryption is a **passthrough** — health data stored as plaintext | [`app/utils/encryption.py:10-24`](app/utils/encryption.py#L10-L24) (`return data`) |
| `CORS allow_origins=["*"]` **with** `allow_credentials=True` — invalid combo browsers reject | [`main.py:30-31`](main.py#L30-L31) |
| Debug logging to a file on every request, `verify_aud=False` JWT fallback | [`app/core/security.py:9-12, 48-59`](app/core/security.py#L48-L59) |
| No rate limiting, no request-size limits | `main.py` (none present) |

---

## 3. A real bug found during analysis

**Disease detection is silently broken.** In the symptoms stage:

```python
# agents/symptoms_agent.py:11-18  — imports pcos_client TWICE, never imports diabetes_client
from model_clients.pcos_client import pcos_client
from model_clients.pcos_client import pcos_client   # duplicate

# agents/symptoms_agent.py:63  — but this line uses it:
diabetes_client.predict(questionnaire),             # NameError: diabetes_client is not defined
```

Because `diabetes_client` is referenced while building the `asyncio.gather(...)` argument list — **before** `gather` runs — the `NameError` is *not* caught by `return_exceptions=True`. It propagates up, is swallowed by `node_symptoms`' `try/except` ([`orchestrator_agent.py:97-99`](agents/orchestrator_agent.py#L97-L99)), and the **entire symptoms stage returns nothing** — every request loses all ML disease risk while looking "successful."

**One-line fix:** add `from model_clients.diabetes_client import diabetes_client` and drop the duplicate `pcos_client` import. I can apply this now if you want.

---

## 4. The Data Flywheel — what was added

Your description is exactly right, and the backend half is now scaffolded and compiles. Files created:

| File | Role in the flywheel |
|---|---|
| [`migrations/002_feedback.sql`](migrations/002_feedback.sql) | `feedback` table — stores score **plus full context** (`user_prompt`, `ai_response`, `orchestrator_logs`, `dosha_context`, optional `feedback_text`) |
| [`app/routes/feedback_route.py`](app/routes/feedback_route.py) | `POST /api/feedback` (👍/👎 + correction) and `GET /api/feedback/stats` |
| [`app/services/few_shot_retriever.py`](app/services/few_shot_retriever.py) | **Short-term benefit** — pulls top-k 👍 answers for the same dosha and injects them as examples. Works day one, no training. |
| [`scripts/export_feedback.py`](scripts/export_feedback.py) | **Long-term benefit (RLHF)** — exports 👍 pairs as JSONL for LLM fine-tuning, and 👎 rows grouped by dosha/condition as ML penalty data |
| [`app/services/supabase_async.py`](app/services/supabase_async.py) | Shared **async + pooled** Supabase client the above use (also the fix for 2.3/2.4) |
| `main.py` | Route wired in; pooled sockets closed on shutdown |

**How the four stages map to the code you described:**

1. **Frontend collection (👍/👎/📝)** → still to add: a `FeedbackButtons` component that POSTs to `/api/feedback`. Drop-in React is in the appendix.
2. **Storage with full context** → `feedback` table + `feedback_route.py`. It stores the whole context, exactly as you specified.
3. **Dynamic few-shot** → `few_shot_retriever.get_few_shot_examples(prompt, dosha)`. Wire it into `node_synthesize` right before `call_llm`:
   ```python
   examples = await get_few_shot_examples(user_msg, s.prakriti.dominant_dosha)
   result = await call_llm(ORCHESTRATOR_PROMPT + examples, user_msg)
   ```
4. **Continuous training (RLHF)** → run `python -m scripts.export_feedback` weekly. Feed `llm_sft_*.jsonl` to a LoRA fine-tune of Llama 3.1 8B / Mistral 7B; feed `ml_penalties_*.csv` into your model `train.py` as down-weighted/negative samples.

**To activate:** run `migrations/002_feedback.sql` in Supabase, then the endpoint is live. (Supabase MCP needs authorizing before I can run it for you — otherwise paste it into the SQL editor.)

---

## 5. Replacing PyTorch with a lightweight stack

### 5.1 Why PyTorch is the wrong tool here

Looking at the actual model definitions, these are **small tabular neural nets**:

```python
# diabetes/app/model.py — 8 numeric inputs → 128 → 64 → 16 → 1  (Pima-style tabular)
# brahma/app/model.py    — 29 categorical inputs → 512 → 256 → 128 → 6 dosha classes
```

These are **classic structured/tabular classification problems**. On tabular data, gradient-boosted decision trees (GBDT) **routinely beat MLPs** in accuracy, and they do it with a fraction of the footprint. Shipping `torch` (~2 GB, GPU machinery, slow import) to run an 8-feature classifier is pure overhead.

### 5.2 Recommended stack

| Model type in your repo | Replace PyTorch with | Why |
|---|---|---|
| **Tabular** — diabetes, brahma (dosha), autoimmune, obesity, pcos, herbs, dietplain, symptom_treatment | **LightGBM** (or XGBoost) | ~5 MB dep vs ~2 GB. Microsecond inference, no GPU. Usually **more accurate** on tabular. Trains in seconds. |
| **Image** — skin (uses `torchvision` CNN) | Train once, export to **ONNX** → serve with **ONNX Runtime** | Drops `torch`+`torchvision` from the *serving* image (~2.5 GB → a few hundred MB). 2–5× faster CPU inference. Keep PyTorch only in the offline training env. |
| **Universal serving runtime** (optional) | **ONNX Runtime** for everything | One tiny runtime serves both LightGBM (via `onnxmltools`) and the CNN. Consistent, fast, CPU-friendly. |

**Concrete win for a tabular service** (e.g. diabetes):

```python
# requirements.txt   BEFORE: torch, pandas, numpy, scikit-learn   (~2 GB)
# requirements.txt   AFTER:  lightgbm, numpy                       (~15 MB)

import lightgbm as lgb
model = lgb.Booster(model_file="diabetes.txt")   # loads in ms
proba = model.predict(features)[0]               # microseconds, no tensor, no GPU
```

- **Container size:** ~2 GB → ~150 MB per ML service.
- **Cold start:** seconds → sub-second (matters for autoscaling / serverless).
- **Inference latency:** milliseconds → microseconds for the tabular models.
- **Accuracy:** equal or better on tabular; the image model is unchanged (same weights, just ONNX-exported).

### 5.3 Bonus: make the safety agent rule-based

`safety_agent` currently spends an LLM call to check contraindications. Contraindication logic ("herb X unsafe with condition Y / pregnancy") is a **lookup table**, not a reasoning task. Moving it to a small rules dict removes one LLM round-trip from every request *and* makes safety deterministic and auditable — strictly better for a health app.

### 5.4 Migration path (low risk)

1. Keep the FastAPI microservice interface identical — only the model internals change, so `model_clients/` and the backend need **zero** changes.
2. Per service: retrain as LightGBM on the existing CSV, save the booster, swap `model.py` loader + `requirements.txt`. Validate accuracy against the current model on a holdout set before switching.
3. Do **skin** last (CNN → ONNX export), since it's the only genuine deep-learning case.

---

## 6. Prioritized action list

| # | Action | Impact | Effort | Section |
|---|---|---|---|---|
| 1 | Fix `diabetes_client` import bug | 🔴 Restores all disease detection | 2 min | 3 |
| 2 | Parallelize prakriti∥vikriti and dravya∥ahara; make safety rule-based | 🔴 ~½ the LLM wait | 3 hr | 2.1, 5.3 |
| 3 | Run pipeline as background job + poll/SSE | 🔴 20 s → ~200 ms response | 6 hr | 2.2 |
| 4 | Migrate DB calls to `supabase_async.py` (async + pooled) | 🔴 Unblocks event loop | 3 hr | 2.3, 2.4 |
| 5 | Shared `httpx.AsyncClient` in `llm_client` + `base_client` | 🟠 Kills handshake tax | 1 hr | 2.4 |
| 6 | Redis cache for profile + ML results | 🟠 ~40% fewer calls | 4 hr | 2.5 |
| 7 | Replace tabular PyTorch → LightGBM; skin → ONNX | 🟠 10× lighter, faster, cheaper | 1–2 days | 5 |
| 8 | Real encryption (PyNaCl), fix CORS+credentials, add rate limiting | 🟡 Security/compliance | 3 hr | 2.7 |
| 9 | Ship `FeedbackButtons` + wire few-shot into synthesis | 🟢 Flywheel goes live | 3 hr | 4 |

**Fastest high-value sequence:** #1 (2 min) → #2 → #3 → #4. That alone takes a request from ~20 s blocking to a ~200 ms response with the heavy work parallelized in the background.

---

## Appendix — Frontend `FeedbackButtons` (drop-in)

```tsx
"use client";
import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export function FeedbackButtons({ sessionId, userPrompt, aiResponse, doshaContext, orchestratorLogs, token }: {
  sessionId: string; userPrompt: string; aiResponse: string;
  doshaContext?: Record<string, unknown>; orchestratorLogs?: Record<string, unknown>; token: string;
}) {
  const [done, setDone] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [showBox, setShowBox] = useState(false);

  const send = async (score: number, feedback_text = "") => {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        session_id: sessionId, user_prompt: userPrompt, ai_response: aiResponse,
        feedback_score: score, feedback_text,
        dosha_context: doshaContext ?? {}, orchestrator_logs: orchestratorLogs ?? {},
      }),
    });
    setDone(score);
  };

  if (done === 1) return <span className="text-xs text-green-600">Thanks! 🙏</span>;

  return (
    <div className="flex items-center gap-2 mt-1">
      <button onClick={() => send(1)} title="Good"><ThumbsUp className="w-4 h-4 text-gray-400 hover:text-green-600" /></button>
      <button onClick={() => setShowBox(true)} title="Needs work"><ThumbsDown className="w-4 h-4 text-gray-400 hover:text-red-600" /></button>
      {showBox && done === null && (
        <>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What was wrong?"
                 className="text-xs border rounded px-2 py-1 w-48" />
          <button onClick={() => send(-1, text)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Send</button>
        </>
      )}
    </div>
  );
}
```

*End of report.*
