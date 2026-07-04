# Dravya Labs — Backend Master Document

> **The single source of truth for the Dravya Labs AI backend.**
> Architecture · API · performance analysis · known bugs · the orchestrator + RLHF upgrade · lightweight ML migration · roadmap.
>
> **Stack:** FastAPI · LangGraph · Mistral/OpenAI/Anthropic (raw HTTP) · Supabase (PostgREST) · Pinecone · Sentence-Transformers
> **Last updated:** 2026-07-04 · Line references verified against source.

---

## Table of Contents

**PART I — REFERENCE**
1. [Overview](#1-overview)
2. [Directory Structure](#2-directory-structure)
3. [Runtime Architecture](#3-runtime-architecture)
4. [The Two Pipelines](#4-the-two-pipelines)
5. [Agents & Orchestrators](#5-agents--orchestrators)
6. [Multi-LLM Layer](#6-multi-llm-layer)
7. [ML Microservices & Model Clients](#7-ml-microservices--model-clients)
8. [Memory Layer (Supabase + Pinecone)](#8-memory-layer-supabase--pinecone)
9. [Data Flywheel (RLHF / Feedback)](#9-data-flywheel-rlhf--feedback)
10. [HTTP API Reference](#10-http-api-reference)
11. [Data Schemas](#11-data-schemas)
12. [Configuration & Environment](#12-configuration--environment)
13. [Database Schema](#13-database-schema)
14. [Running the Backend](#14-running-the-backend)

**PART II — ANALYSIS**
15. [What Is Slowing the Backend](#15-what-is-slowing-the-backend)
16. [Known Bugs & Correctness Risks](#16-known-bugs--correctness-risks)
17. [Security Gaps](#17-security-gaps)

**PART III — THE UPGRADE**
18. [Hierarchical Orchestrator (Feature #1)](#18-hierarchical-orchestrator-feature-1)
19. [Multi-LLM Routing & Voting (Feature #2)](#19-multi-llm-routing--voting-feature-2)
20. [Critic Loop (Feature #3)](#20-critic-loop-feature-3)
21. [Data Flywheel Implementation (Feature #4)](#21-data-flywheel-implementation-feature-4)

**PART IV — MIGRATION & ROADMAP**
22. [Replacing PyTorch with a Lightweight Stack](#22-replacing-pytorch-with-a-lightweight-stack)
23. [Prioritized Roadmap](#23-prioritized-roadmap)
24. [File-by-File Index](#24-file-by-file-index)
25. [Appendix: Frontend Feedback Component](#25-appendix-frontend-feedback-component)

---
---

# PART I — REFERENCE

## 1. Overview

The backend is an **AI orchestrator** for an Ayurvedic health assistant. It takes a user's
health profile + symptoms, runs a set of ML models and LLM reasoning steps, and returns a
personalized wellness plan (constitution, herbs, diet, lifestyle, safety).

There are **two orchestration modes**, selected by the `USE_HIERARCHICAL_ORCHESTRATOR`
feature flag:

| Mode | Flag | Description |
|---|---|---|
| **Linear pipeline** (legacy, default) | `false` | 9-node LangGraph: memory → symptoms → prakriti → vikriti → dravya → ahara → safety → synthesize → save |
| **Hierarchical orchestrator** (new) | `true` | Supervisor pattern: memory → ML Orchestrator (Scientist) → LLM Orchestrator (Communicator w/ router + critic loop) → save |

The backend is a thin **AI gateway**: the actual ML models run as **separate FastAPI
microservices** (skin, brahma, diabetes, …). The backend calls them over HTTP via
`model_clients/`. This means the ML stack (currently PyTorch) can be swapped for a lighter
one (LightGBM / ONNX) **without changing the backend** — see [Part IV](#22-replacing-pytorch-with-a-lightweight-stack).

---

## 2. Directory Structure

```
backend/
├── main.py                          # FastAPI app + core endpoints (/api/analyze, /api/chat, /api/treatment/*, /api/health)
│
├── agents/                          # AI reasoning layer
│   ├── schemas.py                   # SharedState + all Pydantic models (single source of truth)
│   ├── orchestrator_agent.py        # LINEAR LangGraph pipeline (9 nodes) + run_pipeline() dispatcher
│   ├── llm_client.py                # ★ Multi-provider LLM client (Mistral/OpenAI/Anthropic, pooled httpx)
│   │
│   ├── prakriti_agent.py            # Body constitution (LLM)           ─┐
│   ├── vikriti_agent.py             # Dosha imbalance (LLM)              │ used by the
│   ├── symptoms_agent.py            # Aggregates 8 ML model calls        │ LINEAR pipeline
│   ├── dravya_herb_agent.py         # Herb recommendations (LLM + ML)    │
│   ├── ahara_agent.py               # Diet recommendations (LLM + ML)    │
│   ├── safety_agent.py              # Gatekeeper (LLM + safety rules)   ─┘
│   │
│   ├── hierarchical_orchestrator.py # ★ Main Orchestrator (CMO) — the new graph
│   ├── ml_orchestrator.py           # ★ Models Orchestrator ("Scientist") — all ML concurrently
│   ├── llm_orchestrator.py          # ★ LLM Orchestrator ("Communicator") — router + critic loop
│   ├── llm_router.py                # ★ Prompt difficulty classifier (simple/complex/critical)
│   ├── llm_ensemble.py              # ★ Multi-model voting + LLM-as-judge
│   └── critic_agent.py              # ★ Ayurvedic output validator (loop engineering)
│
├── app/
│   ├── core/
│   │   ├── config.py                # Settings (env vars, provider keys, routing, feature flags)
│   │   └── security.py              # verify_user() — Supabase JWT verification
│   ├── routes/
│   │   ├── agent_routes.py          # /api/generate-plan, /api/history, /api/upload-image
│   │   ├── onboarding_route.py      # /api/onboarding/save-profile, /get-profile
│   │   ├── chat_sessions_route.py   # /api/chat/sessions (list/delete)
│   │   ├── feedback_route.py        # ★ /api/feedback (Data Flywheel)
│   │   ├── ai_route.py              # /analyze/{profile_id}
│   │   ├── retriveal_route.py       # /profile/{profile_id}   ⚠️ broken import (see §16)
│   │   └── health_route.py          # health analysis route   ⚠️ broken import (see §16)
│   ├── services/
│   │   ├── supabase.py              # SYNC Supabase REST helpers (legacy)
│   │   ├── supabase_async.py        # ★ ASYNC + pooled Supabase client
│   │   ├── few_shot_retriever.py    # ★ Dynamic few-shot from 👍 feedback
│   │   ├── pinecone.py              # Pinecone index access (uses settings.PINECONE_INDEX)
│   │   └── embeddings.py            # Sentence-Transformers embedding
│   ├── rag/                         # retriever.py, context_builder.py
│   ├── models/health.py            # Pydantic models for health data
│   └── utils/
│       ├── encryption.py            # ⚠️ PASSTHROUGH (no real encryption — see §17)
│       └── formatting.py
│
├── memory/
│   ├── health_memory_manager.py     # Supabase + Pinecone read/write orchestration
│   └── vector_store.py              # Pinecone upsert/query  ⚠️ hardcodes index "dravya-labs" (see §16)
│
├── model_clients/                   # HTTP wrappers for the 10 ML microservices
│   ├── base_client.py               # BaseModelClient (retry, timeout, graceful degradation)
│   ├── skin_client.py  hair_client.py  pcos_client.py  diabetes_client.py
│   ├── autoimmune_client.py  obesity_client.py  brahma_client.py
│   ├── symptom_treatment_client.py  herbs_client.py  dietplain_client.py
│
├── scripts/
│   └── export_feedback.py           # ★ Weekly RLHF export (JSONL for LLM SFT + CSV penalties for ML)
│
├── migrations/
│   └── 002_feedback.sql             # ★ feedback table
│
├── setup_supabase.sql               # base tables (profiles, chat_sessions, analysis_history)
├── requirement.txt                  # Python deps
└── .env.example

★ = added/rewritten in the recent upgrade.   ⚠️ = has a known issue.
```

---

## 3. Runtime Architecture

```
                        ┌──────────────────────────────┐
   Frontend (Next.js) ──┤  FastAPI (main.py)           │
      HTTP + JWT        │  CORS · routes · endpoints    │
                        └───────────────┬───────────────┘
                                        │ run_pipeline(state)
                        ┌───────────────▼───────────────┐
                        │  Dispatcher (orchestrator_     │
                        │  agent.run_pipeline)           │
                        │  reads USE_HIERARCHICAL_...    │
                        └──────┬──────────────────┬──────┘
                    flag=false │                  │ flag=true
                    ┌──────────▼─────┐   ┌─────────▼──────────────┐
                    │ LINEAR graph   │   │ HIERARCHICAL graph      │
                    │ (9 nodes)      │   │ memory→ML→LLM→save       │
                    └──────┬─────────┘   └───┬──────────┬──────────┘
                           │                 │          │
             ┌─────────────┼─────────┐  ┌────▼───┐  ┌───▼──────────┐
             │  ML clients (HTTP)     │  │  ML    │  │ LLM layer    │
             │  → 10 microservices    │  │ Orch.  │  │ router+vote  │
             └────────────┬───────────┘  └────────┘  │ +critic loop │
                          │                           └──────┬───────┘
                          │                                  │
               ┌──────────▼──────────┐            ┌──────────▼──────────┐
               │ Supabase (PostgREST)│            │ LLM providers (HTTP)│
               │ Pinecone (vectors)  │            │ Mistral/OpenAI/Anthr│
               └─────────────────────┘            └─────────────────────┘
```

**Per-request cost (linear mode):** 2 Supabase calls + 1 Pinecone query + 8 ML calls +
**6 sequential LLM calls** + 1 Pinecone upsert + 1 Supabase insert → 15–30 s.

---

## 4. The Two Pipelines

### 4.1 Linear pipeline (default, `orchestrator_agent.py`)

Nodes run **sequentially**; each wraps an agent with error handling (a failed node appends
to `pipeline_errors` and the pipeline continues):

```
memory_retrieve → symptoms → prakriti → vikriti → dravya → ahara → safety → synthesize → memory_save → END
```

- **1 Pinecone query + 1 Supabase read** (memory_retrieve)
- **8 concurrent ML calls** (symptoms — the one place parallelism is already used)
- **6 sequential LLM calls** (prakriti, vikriti, dravya, ahara, safety, synthesize) ← main latency
- **1 Supabase insert + 1 Pinecone upsert** (memory_save)

### 4.2 Hierarchical orchestrator (`hierarchical_orchestrator.py`)

```
memory_retrieve → ml_orchestrator → llm_orchestrator → memory_save → END
```

- **ml_orchestrator** runs all 10 ML models concurrently → `MLFacts`
- **llm_orchestrator** internally: route → generate (single model or ensemble) → **critic review → regenerate loop** (≤ `MAX_CRITIC_RETRIES`)
- Records `orchestrator_logs` (route, model used, attempts, critic verdict, flags) for the Data Flywheel

Enable with `USE_HIERARCHICAL_ORCHESTRATOR=true`. Both pipelines return the same
`GeneratePlanResponse`, so callers don't change.

---

## 5. Agents & Orchestrators

### Linear-pipeline agents

| Agent | File | Type | Output |
|---|---|---|---|
| Prakriti | `prakriti_agent.py` | LLM | `PrakritiResult` (dosha %s, dominant dosha) |
| Vikriti | `vikriti_agent.py` | LLM | `VikritiResult` (aggravated doshas, severity) |
| Symptoms | `symptoms_agent.py` | ML aggregator | `SymptomsResult` (8 model outputs + flags) |
| Dravya (herbs) | `dravya_herb_agent.py` | LLM + ML | `DravyaResult` |
| Ahara (diet) | `ahara_agent.py` | LLM + ML | `AharaResult` |
| Safety | `safety_agent.py` | LLM + rules | `SafetyResult` (verdict, disclaimer) |

### Hierarchical orchestrator components

| Component | File | Role | LLM? |
|---|---|---|---|
| **Main Orchestrator** ("CMO") | `hierarchical_orchestrator.py` | Builds graph, coordinates flow, records logs | No |
| **Models Orchestrator** ("Scientist") | `ml_orchestrator.py` | Runs all ML models concurrently → `MLFacts` | **No** (pure ML) |
| **LLM Orchestrator** ("Communicator") | `llm_orchestrator.py` | Router → generate → critic loop → final text | Yes |
| **LLM Router** | `llm_router.py` | Classifies prompt: simple / complex / critical | Cheap LLM |
| **LLM Ensemble** | `llm_ensemble.py` | Parallel voting + judge for critical prompts | Yes |
| **Critic Agent** | `critic_agent.py` | Validates draft vs dosha/conditions/ML facts | Cheap LLM |

---

## 6. Multi-LLM Layer

### `llm_client.py` — unified provider client (pure `httpx`, no vendor SDKs)

Provider inferred from the model name:

| Model prefix | Provider | Endpoint |
|---|---|---|
| `gpt`, `o1`, `o3`, `o4` | OpenAI | `/v1/chat/completions` |
| `claude` | Anthropic | `/v1/messages` |
| anything else | Mistral | `/v1/chat/completions` |

Two entry points:
- `call_llm(system, user, *, model=None, ...) -> dict` — parses JSON (all agents use this; **backward-compatible**)
- `call_llm_text(system, user, *, model=None, ...) -> str` — raw text (router/judge/synthesis)

**Key properties**
- **Shared pooled `httpx.AsyncClient`** (keep-alive; no new TCP per call). Closed on shutdown.
- **Graceful fallback:** missing provider key → falls back to Mistral + logs a warning. The app runs on Mistral alone; other tiers activate automatically once keys are added.
- Retries on timeout/connection errors (tenacity, 3 attempts, exp backoff).

### Routing tiers (configurable in `config.py`)

| Route | Trigger | Model (default) |
|---|---|---|
| `simple` | greetings, follow-ups, extraction | `LLM_SIMPLE_MODEL` = `mistral-small-latest` |
| `complex` | diagnosis, personalized plans | `LLM_COMPLEX_MODEL` = `mistral-large-latest` |
| `critical` | emergency/safety keywords | Ensemble vote over `LLM_ENSEMBLE_MODELS` |

### Ensemble voting (`llm_ensemble.py`)
Runs configured models in parallel; a cheap **judge** (`LLM_JUDGE_MODEL`) picks the safest
answer. Only models with a configured provider key run; with 0–1 available it degrades to a
single call (no wasted cost).

### Critic loop (`critic_agent.py` + `llm_orchestrator.py`)
Each draft is reviewed for **dosha consistency · contraindication safety · completeness ·
fidelity to ML facts**. On rejection, the Communicator regenerates with the critic's fix
instructions, up to `MAX_CRITIC_RETRIES` (default 3). The critic **fails open** — an error
approves the draft (never blocks the user) and is logged.

---

## 7. ML Microservices & Model Clients

The backend calls **10 external model services** over HTTP. Each has a client in
`model_clients/` extending `BaseModelClient` (retry, timeout, graceful
`{"status": "unavailable"|"error"}` on failure — never raises into the pipeline).

| Client | Model service | Input | Default port |
|---|---|---|---|
| `skin_client` | Skin condition (image CNN) | image_url | — |
| `hair_client` | Hair condition (image) | image_url | — |
| `pcos_client` | PCOS risk (tabular) | questionnaire | — |
| `diabetes_client` | Diabetes risk (8-feature tabular) | questionnaire | — |
| `autoimmune_client` | Autoimmune risk (tabular) | questionnaire | 8003 |
| `obesity_client` | Obesity risk (tabular) | questionnaire | — |
| `brahma_client` | Prakriti/dosha (29-feature tabular) | questionnaire | 8005 |
| `symptom_treatment_client` | Ayurvedic disease→treatment | questionnaire | 8006 |
| `herbs_client` | Herb retrieval | query + top_k | 8002 |
| `dietplain_client` | Diet/nutrition retrieval | macros + top_k | 8004 |

All services currently ship **PyTorch (`torch` ~2 GB each)**. See [Part IV](#22-replacing-pytorch-with-a-lightweight-stack) for the LightGBM/ONNX migration.

---

## 8. Memory Layer (Supabase + Pinecone)

`memory/health_memory_manager.py` coordinates two stores:

- **Supabase (PostgREST)** — structured rows: `user_health_profiles`, `chat_sessions`, `analysis_history`.
- **Pinecone** — vector memories of past consultations (embedded with `all-MiniLM-L6-v2` via `app/services/embeddings.py`).

Flow:
- **Before** agents: `retrieve_health_context(user_id)` → `{profile, history, memories}`.
- **After** pipeline: `save_consultation(user_id, report)` → Supabase insert + Pinecone upsert.

> ⚠️ Two Pinecone modules exist with **inconsistent index names**: `app/services/pinecone.py`
> uses `settings.PINECONE_INDEX` (default `dravya-health-profiles`) while
> `memory/vector_store.py:29` **hardcodes** `pc.Index("dravya-labs")`. Consolidate these (see §16).

---

## 9. Data Flywheel (RLHF / Feedback)

Turns the app into a learning system. Four stages:

1. **Collect** — frontend 👍/👎/📝 buttons POST to `/api/feedback`.
2. **Store (with full context)** — `feedback` table saves `user_prompt`, `ai_response`,
   `orchestrator_logs` (which models ran, route, critic verdict), `dosha_context`,
   `feedback_score` (+1/−1), `feedback_text`.
3. **Short-term — Dynamic Few-Shot** (`services/few_shot_retriever.py`): before synthesis,
   fetch top-k 👍 answers for the **same dosha** and inject them as examples. Improves
   quality immediately, no training. Wired into the hierarchical LLM orchestrator.
4. **Long-term — RLHF export** (`scripts/export_feedback.py`, weekly):
   - `llm_sft_<date>.jsonl` → fine-tune a cheap open model (Llama 3.1 8B / Mistral 7B).
   - `ml_penalties_<date>.csv` → down-weight consistently-downvoted ML recommendations when retraining model services.

Full implementation detail in [§21](#21-data-flywheel-implementation-feature-4).

---

## 10. HTTP API Reference

### Core endpoints (`main.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/analyze` | none¹ | Full pipeline: symptoms → plan (`AnalysisResult`) |
| POST | `/api/chat` | none¹ | Conversational message (`ChatResponse`) |
| POST | `/api/treatment/generate` | none¹ | Generate a treatment plan |
| POST | `/api/treatment/review` | none¹ | Review/validate a treatment plan |
| GET | `/api/health` | none | Liveness/health check |

### Router endpoints

| Method | Path | Router | Auth | Status |
|---|---|---|---|---|
| POST | `/api/generate-plan` | agent_routes | — | ok |
| GET | `/api/history/{user_id}` | agent_routes | — | ok |
| POST | `/api/upload-image` | agent_routes | — | ok |
| POST | `/api/onboarding/save-profile` | onboarding | JWT | ok |
| GET | `/api/onboarding/get-profile` | onboarding | JWT | ok |
| GET | `/api/chat/sessions` | chat_sessions | JWT | ok |
| DELETE | `/api/chat/sessions/{session_id}` | chat_sessions | JWT | ok |
| **POST** | **`/api/feedback`** | **feedback** ★ | **JWT** | ok |
| **GET** | **`/api/feedback/stats`** | **feedback** ★ | **JWT** | ok |
| POST | `/analyze/{profile_id}` | ai_route | — | ⚠️ router skipped (broken import, §16) |
| GET | `/profile/{profile_id}` | retrieval | — | ⚠️ router skipped (broken import, §16) |

¹ These core endpoints take `user_id` in the body rather than enforcing JWT.

### `POST /api/feedback` (Data Flywheel)

```jsonc
// Request (Authorization: Bearer <supabase-jwt>)
{
  "session_id": "abc",
  "user_prompt": "What should I eat for my Pitta imbalance?",
  "ai_response": "…",
  "feedback_score": 1,               // +1 👍 or -1 👎
  "feedback_text": "",               // optional correction
  "orchestrator_logs": { "route": "complex", "model_used": "mistral-large-latest" },
  "dosha_context": { "dominant_dosha": "pitta" }
}
// Response
{ "status": "stored", "id": "<uuid>" }
```

---

## 11. Data Schemas

Defined in `agents/schemas.py`. `SharedState` is the object every node reads/mutates.

**Inputs:** `UserProfile`, `HealthMetrics`, `DietInfo`, `MedicalHistory`, `SymptomsInput`
**Agent outputs:** `PrakritiResult`, `VikritiResult`, `SymptomsResult`, `DravyaResult`, `AharaResult`, `SafetyResult`
**Hierarchical (new):**
- `MLFacts` — all 10 model outputs + `dominant_dosha`, `health_flags`, `errors`
- `LLMResponse` — `text`, `model_used`, `route`, `attempts`
- `CritiqueResult` — `approved`, `reasons`, `fix_instructions`, `retry_count`

`SharedState` also carries: `memory_context`, `orchestrator_summary`, `ml_facts`,
`llm_response`, `critique`, `orchestrator_logs`, `pipeline_errors`, `messages` (A2A bus).

**API I/O:** `GeneratePlanRequest`, `GeneratePlanResponse`.

---

## 12. Configuration & Environment

All settings live in `app/core/config.py` (`Settings`, read from `.env`).

```bash
# ── Security ──
SUPABASE_JWT_SECRET=...

# ── Supabase ──
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# ── Pinecone ──
PINECONE_API_KEY=...
PINECONE_INDEX=dravya-health-profiles
PINECONE_MEMORY_INDEX=dravya-health-profiles

# ── LLM providers ──
MISTRAL_API_KEY=...                    # required
MODEL_NAME=mistral-large-latest
OPENAI_API_KEY=                        # optional — enables gpt-* routing/voting
ANTHROPIC_API_KEY=                     # optional — enables claude-* routing/voting

# ── Multi-LLM routing ──
LLM_SIMPLE_MODEL=mistral-small-latest
LLM_COMPLEX_MODEL=mistral-large-latest
LLM_ENSEMBLE_MODELS=mistral-large-latest,gpt-4o,claude-sonnet-5
LLM_JUDGE_MODEL=mistral-small-latest

# ── Feature flags ──
USE_HIERARCHICAL_ORCHESTRATOR=false    # true → new hierarchical pipeline
MAX_CRITIC_RETRIES=3

# ── Embeddings ──
SENTENCE_TRANSFORMER_MODEL=all-MiniLM-L6-v2

# ── ML microservice URLs (blank = client returns "unavailable") ──
SKIN_MODEL_API_URL=      HAIR_MODEL_API_URL=      PCOS_MODEL_API_URL=
DIABETES_MODEL_API_URL=  AUTOIMMUNE_MODEL_API_URL=http://localhost:8003/predict
OBESITY_MODEL_API_URL=   BRAHMA_MODEL_API_URL=http://localhost:8005/predict
DIETPLAIN_MODEL_API_URL=http://localhost:8004/predict
HERBS_MODEL_API_URL=http://localhost:8002/predict
SYMPTOM_TREATMENT_MODEL_API_URL=http://localhost:8006/predict
MODEL_CLIENTS_TIMEOUT=30
```

---

## 13. Database Schema

### Base tables — `setup_supabase.sql`
- `user_health_profiles(user_id PK, encrypted_health_json, created_at, updated_at)`
- `chat_sessions(session_id PK, user_id, title, created_at, updated_at)`
- `analysis_history(analysis_id PK, user_id, session_id, result_json, created_at)`

### Feedback table — `migrations/002_feedback.sql` ★
```sql
feedback(
  id UUID PK, user_id UUID, session_id TEXT,
  user_prompt TEXT, ai_response TEXT,
  orchestrator_logs JSONB, feedback_score SMALLINT CHECK (-1|1),
  feedback_text TEXT, dosha_context JSONB, created_at TIMESTAMPTZ
)
-- indexes: user_id, feedback_score, gin(dosha_context)
```
Run once in the Supabase SQL editor to activate the flywheel.

> ⚠️ `encrypted_health_json` is currently **plaintext** — see [§17](#17-security-gaps).

---

## 14. Running the Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirement.txt

# create .env from .env.example and fill in keys
uvicorn main:app --reload --port 8000
```

- API docs: `http://localhost:8000/docs`
- ML microservices (`../skin`, `../brahma`, …) run separately on their own ports.
- Enable the new pipeline: set `USE_HIERARCHICAL_ORCHESTRATOR=true` + run `migrations/002_feedback.sql`.
- Windows helper: `start.bat`.

**Dependencies (`requirement.txt`):** fastapi, uvicorn, python-dotenv, httpx, aiohttp,
pinecone, sentence-transformers, python-jose[cryptography], pydantic, tenacity, langgraph.

---
---

# PART II — ANALYSIS

## 15. What Is Slowing the Backend

In order of impact:

### 🔴 1. Six LLM calls run in series (the #1 cost)
The linear pipeline chains six LLM-driven nodes with `add_edge`
([`orchestrator_agent.py:244-253`](agents/orchestrator_agent.py#L244-L253)): prakriti,
vikriti, dravya, ahara, safety, synthesize — each a 2–5 s round-trip, one after another.
**Fix:** run prakriti∥vikriti and dravya∥ahara concurrently, make safety rule-based → ~3
round-trips instead of 6. (The hierarchical mode already collapses this.)

### 🔴 2. The pipeline blocks the HTTP request
`result = await run_pipeline(...)` runs inline in the handler ([`main.py:228`](main.py#L228));
the frontend masks it with a 3-minute `AI_TIMEOUT`. With 4 workers, ~4 users saturate the
server. **Fix:** background job (FastAPI `BackgroundTasks` → Celery/Redis) + poll/SSE.

### 🔴 3. Synchronous `requests` inside async handlers
[`services/supabase.py:13,18`](app/services/supabase.py#L13) uses sync `requests`; inside
`async def` it **freezes the whole event loop** until Supabase replies. `_fetch_user_profile()`
hits this on every analyze/chat/treatment call. **Fix:** use `services/supabase_async.py`
(async + pooled, already added).

### 🟠 4. A new connection per external call (no pooling)
[`llm_client.py` (old)](agents/llm_client.py) and
[`model_clients/base_client.py:79`](model_clients/base_client.py#L79) opened a new
`AsyncClient` per call → ~16 TCP+TLS handshakes/request in the symptoms stage.
**Fix:** shared pooled client (done for LLM + Supabase; apply to `base_client.py`).

### 🟠 5. Zero caching
Profile, ML outputs, and LLM calls are recomputed every request (0% hit rate).
**Fix:** Redis (or `cachetools`) keyed on `user_id` and on a hash of the ML questionnaire.

### 🟡 6. Heavy dependencies inflate cold start & memory
Every ML service ships `torch` (~2 GB); the backend loads `sentence-transformers`. Slow
boots, high memory, expensive to scale. See [Part IV](#22-replacing-pytorch-with-a-lightweight-stack).

---

## 16. Known Bugs & Correctness Risks

| # | Bug | Evidence | Impact |
|---|---|---|---|
| 1 | **Broken `supabase_api` imports** — `health_route.py:5` and `retriveal_route.py:4` import `app.services.supabase_api`, which does not exist (only `supabase.py`). `main.py` wraps router imports in `try/except ImportError: pass`, so these routers are **silently skipped** — their endpoints never register. | verified | 🔴 endpoints missing |
| 2 | **Inconsistent Pinecone index** — `memory/vector_store.py:29` hardcodes `pc.Index("dravya-labs")` while `services/pinecone.py:13` uses `settings.PINECONE_INDEX` (`dravya-health-profiles`). Reads/writes can hit different indexes. | verified | 🔴 memory silently wrong |
| 3 | **`resp.json()` read after client closes** — `llm_client.py` (old) read the body outside the `async with` block. Works only because the body is buffered; fragile. | fixed in rewrite | 🟡 |
| 4 | **Duplicate Pinecone modules** — `services/pinecone.py` vs `memory/vector_store.py` with different init strategies. | verified | 🟠 maintenance |
| 5 | **Brittle LLM JSON parsing** — agents depend on exact JSON; `_parse_json` falls back to `{"raw_response": ...}`, which downstream models may mishandle. | by design | 🟡 flakiness |

**✅ Recently fixed:** the `diabetes_client` import bug in `symptoms_agent.py` — it imported
`pcos_client` twice and referenced an undefined `diabetes_client` at line 63. Because the
`NameError` fired while building the `asyncio.gather` args (before `gather` ran), it was
**not** caught by `return_exceptions=True`; it bubbled to the node's `try/except` and
silently wiped **all** ML disease detection. Now imports `diabetes_client` correctly.

---

## 17. Security Gaps

| # | Issue | Location | Severity |
|---|---|---|---|
| 1 | **Encryption is a passthrough** — `encrypt_json`/`decrypt_json` both `return data`. All health profiles stored plaintext despite the "encrypted" column name (HIPAA/GDPR risk). | `app/utils/encryption.py:10-24` | 🔴 |
| 2 | **CORS `allow_origins=["*"]` + `allow_credentials=True`** — an invalid combination browsers reject; also over-permissive. | `main.py:30-31` | 🟠 |
| 3 | **JWT audience-check fallback** — on failure `verify_user()` retries with `verify_aud=False`, weakening verification. Plus debug logging to `jwt_debug.log` on every call. | `core/security.py:48-59` | 🟡 |
| 4 | **Unauthenticated stateful routes** — core `/api/*` endpoints take `user_id` from the body instead of the JWT. | `main.py` | 🟡 |
| 5 | **No rate limiting / request-size limits.** | `main.py` | 🟡 |
| 6 | **Service-role key used broadly** in backend-to-backend calls — high blast radius if leaked. | services/routes | 🟡 |

**Fix for #1 (real encryption with PyNaCl):**
```python
from nacl import secret, utils, encoding
_box = secret.SecretBox(bytes.fromhex(settings.ENCRYPTION_KEY))  # 32-byte key
def encrypt_json(data: str) -> str:
    return _box.encrypt(data.encode()).hex()
def decrypt_json(token: str) -> str:
    return _box.decrypt(bytes.fromhex(token)).decode()
```

---
---

# PART III — THE UPGRADE

> Features requested: (1) Hierarchical Orchestrator, (2) Multi-LLM Routing & Voting,
> (3) Critic Loop, (4) Data Flywheel/RLHF — all built **lightweight & PyTorch-free**
> (pure `httpx`), **feature-flagged off by default**, degrading gracefully to Mistral-only.

## 18. Hierarchical Orchestrator (Feature #1)

**Supervisor/Worker pattern** — `agents/hierarchical_orchestrator.py` (CMO) coordinates:
- **`ml_orchestrator.py` — "the Scientist":** talks ONLY to ML microservices, fires all 10
  concurrently, returns hard `MLFacts`. No LLM, no prose → the ML layer can be swapped freely.
- **`llm_orchestrator.py` — "the Communicator":** turns facts into advice, running the
  router + critic loop internally.

Graph: `memory_retrieve → ml_orchestrator → llm_orchestrator → memory_save`. Same response
shape as the linear pipeline.

## 19. Multi-LLM Routing & Voting (Feature #2)

- **`llm_router.py`** classifies each prompt `simple` / `complex` / `critical` (keyword
  fast-path for emergencies, else a cheap LLM classification).
- **`llm_ensemble.py`** — for `critical`, runs configured models in parallel and a cheap
  judge picks the safest (**LLM-as-a-Judge**). Only providers with keys run; degrades to a
  single call otherwise.
- **`llm_client.py`** — one unified pure-HTTP client for Mistral/OpenAI/Anthropic with a
  shared pool and Mistral fallback.

## 20. Critic Loop (Feature #3)

`agents/critic_agent.py` reviews every draft against dosha, conditions, and ML facts. On
rejection the Communicator regenerates with fix instructions, up to `MAX_CRITIC_RETRIES`.
Fails open so a critic outage never blocks the user. This is the "double-check before it
reaches the user" loop essential for a health app.

## 21. Data Flywheel Implementation (Feature #4)

| File | Role |
|---|---|
| `migrations/002_feedback.sql` | `feedback` table storing score **+ full context** |
| `app/routes/feedback_route.py` | `POST /api/feedback` + `GET /api/feedback/stats` |
| `app/services/few_shot_retriever.py` | Short-term: inject 👍 answers for the same dosha |
| `scripts/export_feedback.py` | Long-term RLHF export (JSONL + penalty CSV) |
| `app/services/supabase_async.py` | Shared async+pooled Supabase client used by the above |

**Activation:** run `migrations/002_feedback.sql` in Supabase; the endpoint is then live.
Wire `FeedbackButtons` (see [§25](#25-appendix-frontend-feedback-component)) into the chat UI.
Few-shot is auto-injected in the hierarchical LLM orchestrator.

---
---

# PART IV — MIGRATION & ROADMAP

## 22. Replacing PyTorch with a Lightweight Stack

**Why PyTorch is the wrong tool here.** The models are small tabular nets:
```python
# diabetes/app/model.py — 8 numeric inputs → 128 → 64 → 16 → 1 (Pima-style tabular)
# brahma/app/model.py    — 29 categorical inputs → 512 → 256 → 128 → 6 dosha classes
```
On tabular data, gradient-boosted trees usually **beat MLPs** — with a fraction of the footprint.

| Model type in the repo | Replace PyTorch with | Why |
|---|---|---|
| **Tabular** — diabetes, brahma, autoimmune, obesity, pcos, herbs, dietplain, symptom_treatment | **LightGBM** (or XGBoost) | ~15 MB vs ~2 GB. µs inference, no GPU. Usually **more accurate** on tabular. Trains in seconds. |
| **Image** — skin (`torchvision` CNN), hair | Train once → export **ONNX** → serve with **ONNX Runtime** | Drops `torch`+`torchvision` from the serving image (~2.5 GB → hundreds of MB). 2–5× faster CPU. |
| **Universal serving runtime** (optional) | **ONNX Runtime** for both | One tiny runtime serves LightGBM (via `onnxmltools`) and the CNN. |

**Concrete win (diabetes service):**
```python
# requirements.txt  BEFORE: torch, pandas, numpy, scikit-learn  (~2 GB)
# requirements.txt  AFTER:  lightgbm, numpy                      (~15 MB)
import lightgbm as lgb
model = lgb.Booster(model_file="diabetes.txt")   # loads in ms
proba = model.predict(features)[0]               # microseconds, no tensor, no GPU
```
- Container: ~2 GB → ~150 MB per service · cold start: seconds → sub-second · latency: ms → µs (tabular) · accuracy: equal-or-better.

**Bonus:** make the **safety agent rule-based** — contraindications are a lookup table, not
a reasoning task. Removes one LLM round-trip per request and makes safety deterministic.

**Migration is low-risk:** the FastAPI microservice interface stays identical, so
`model_clients/` and the backend need **zero** changes. Per service: retrain as LightGBM on
the existing CSV, swap the loader + `requirements.txt`, validate on a holdout. Do the image
model (skin/hair → ONNX) last.

---

## 23. Prioritized Roadmap

| # | Action | Impact | Effort | Ref |
|---|---|---|---|---|
| 1 | ✅ Fix `diabetes_client` import bug | 🔴 restores disease detection | done | §16 |
| 2 | Fix `supabase_api` broken imports + consolidate Pinecone to one index | 🔴 missing endpoints / wrong memory | 1 hr | §16 |
| 3 | Parallelize prakriti∥vikriti, dravya∥ahara; make safety rule-based | 🔴 ~½ the LLM wait | 3 hr | §15 |
| 4 | Run pipeline as background job + poll/SSE | 🔴 20 s → ~200 ms response | 6 hr | §15 |
| 5 | Migrate DB calls to `supabase_async.py` (async + pooled) | 🔴 unblocks event loop | 3 hr | §15 |
| 6 | Shared `httpx.AsyncClient` in `base_client.py` | 🟠 kills handshake tax | 1 hr | §15 |
| 7 | Redis cache for profile + ML results | 🟠 ~40% fewer calls | 4 hr | §15 |
| 8 | Replace tabular PyTorch → LightGBM; skin → ONNX | 🟠 10× lighter/faster/cheaper | 1–2 days | §22 |
| 9 | Real encryption (PyNaCl), fix CORS+credentials, rate limiting | 🟡 security/compliance | 3 hr | §17 |
| 10 | Ship `FeedbackButtons` + enable hierarchical mode | 🟢 flywheel + orchestrator go live | 3 hr | §21 |

**Fastest high-value sequence:** #1 → #2 → #3 → #4. Takes a request from ~20 s blocking to a
~200 ms response with heavy work parallelized in the background.

---

## 24. File-by-File Index

| File | One-line purpose |
|---|---|
| `main.py` | FastAPI app, CORS, core endpoints, profile helpers, shutdown pool cleanup |
| `agents/schemas.py` | All Pydantic models + `SharedState` |
| `agents/orchestrator_agent.py` | Linear LangGraph pipeline + `run_pipeline()` dispatcher |
| `agents/llm_client.py` ★ | Multi-provider LLM client (pooled httpx) |
| `agents/hierarchical_orchestrator.py` ★ | Main Orchestrator graph (new mode) |
| `agents/ml_orchestrator.py` ★ | Concurrent ML execution → `MLFacts` |
| `agents/llm_orchestrator.py` ★ | Router → generate → critic loop |
| `agents/llm_router.py` ★ | Prompt difficulty classifier |
| `agents/llm_ensemble.py` ★ | Multi-model voting + judge |
| `agents/critic_agent.py` ★ | Ayurvedic output validator |
| `agents/{prakriti,vikriti,symptoms,dravya_herb,ahara,safety}_agent.py` | Linear-pipeline agents |
| `app/core/config.py` | Settings / env / feature flags |
| `app/core/security.py` | JWT verification (`verify_user`) |
| `app/routes/*` | REST endpoints (see §10) |
| `app/services/supabase.py` | Sync Supabase REST (legacy) |
| `app/services/supabase_async.py` ★ | Async + pooled Supabase client |
| `app/services/few_shot_retriever.py` ★ | Dynamic few-shot from feedback |
| `app/services/{pinecone,embeddings}.py` | Vector store + embeddings |
| `app/utils/encryption.py` | ⚠️ Passthrough (replace with real crypto) |
| `memory/health_memory_manager.py` | Supabase + Pinecone read/write |
| `memory/vector_store.py` | Pinecone upsert/query (⚠️ hardcoded index) |
| `model_clients/*` | HTTP wrappers for the 10 ML services |
| `scripts/export_feedback.py` ★ | Weekly RLHF export |
| `migrations/002_feedback.sql` ★ | Feedback table |
| `setup_supabase.sql` | Base tables |

---

## 25. Appendix: Frontend Feedback Component

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

---

*Legend: ★ = added in the recent orchestrator + flywheel upgrade · ⚠️ = has a known issue.*
*This document supersedes `BACKEND_REFERENCE.md`, `PERFORMANCE_AND_FLYWHEEL_REPORT.md`, and `backend_analysis_report.md`.*
