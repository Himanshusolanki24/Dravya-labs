# Dravya Labs — Backend Optimization & Architecture Report

> **Date:** 2026-07-03
> **Scope:** Full codebase audit, architectural redesign, phased migration plan
> **Target:** Production-grade, scalable, AI-native backend with feedback flywheel

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Critical Issues with Line-Level Evidence](#2-critical-issues-with-line-level-evidence)
3. [New Architecture — Hierarchical Orchestrator](#3-new-architecture--hierarchical-orchestrator)
4. [Multi-LLM Orchestrator with Voting](#4-multi-llm-orchestrator-with-voting)
5. [Loop Engineering — Iterative Refinement](#5-loop-engineering--iterative-refinement)
6. [Data Flywheel — Feedback → Continuous Learning](#6-data-flywheel--feedback--continuous-learning)
7. [Tech Stack Upgrade Matrix](#7-tech-stack-upgrade-matrix)
8. [Full File Change Inventory](#8-full-file-change-inventory)
9. [Phased Implementation Roadmap](#9-phased-implementation-roadmap)
10. [Estimated Performance Gains](#10-estimated-performance-gains)

---

## 1. Current State Analysis

### Project Structure

```
backend/                          # AI Orchestrator (FastAPI + LangGraph)
├── main.py                       # Entry point: FastAPI app, 5 main endpoints
├── agents/                       # 6 AI Agents in linear LangGraph pipeline
│   ├── orchestrator_agent.py     # LangGraph StateGraph (9 nodes, linear)
│   ├── llm_client.py             # Mistral-only wrapper (direct API)
│   ├── schemas.py                # SharedState, all Pydantic models
│   ├── prakriti_agent.py         # Body constitution (LLM-based)
│   ├── vikriti_agent.py          # Dosha imbalance (LLM-based)
│   ├── symptoms_agent.py         # ML model aggregator (8 concurrent calls)
│   ├── dravya_herb_agent.py      # Herbal recommendations (LLM + ML)
│   ├── ahara_agent.py            # Diet recommendations (LLM + ML)
│   └── safety_agent.py           # Gatekeeper (LLM + herb safety API)
├── app/
│   ├── routes/                   # REST endpoints
│   ├── services/                 # Supabase, Pinecone, Embeddings
│   ├── core/                     # Config, Security (JWT)
│   └── utils/                    # Encryption (passthrough!)
├── memory/                       # Pinecone vector store + health memory
├── model_clients/                # 8 ML microservice wrappers
└── worker/                       # ❌ DOES NOT EXIST — no background jobs
```

### Data Flow (Current)

```
User → Frontend → HTTP POST /api/analyze
                       │
                       ▼
              FastAPI Handler (main.py:228)
                       │
                       ▼
              LangGraph Pipeline (orchestrator_agent.py:282)
                       │
                       ├── 1. Memory Retrieve (Supabase + Pinecone)
                       ├── 2. Symptoms Agent (8 concurrent ML calls)
                       ├── 3. Prakriti Agent (1 LLM call)
                       ├── 4. Vikriti Agent (1 LLM call)
                       ├── 5. Dravya Agent (1 LLM call + ML)
                       ├── 6. Ahara Agent (1 LLM call + ML)
                       ├── 7. Safety Agent (1 LLM call + API)
                       ├── 8. Synthesize Agent (1 LLM call)
                       └── 9. Memory Save (Supabase + Pinecone)
                       │
                       ▼
              Response → User (15-30 seconds later)
```

**Total per request:** 2 Supabase calls + 1 Pinecone query + 8 ML API calls + **5 sequential LLM calls** + 1 Pinecone upsert + 1 Supabase insert

---

## 2. Critical Issues with Line-Level Evidence

### 2.1 Synchronous Pipeline Blocks HTTP Request

| File | Line | Issue |
|------|------|-------|
| `backend/main.py` | 228 | `result = await run_pipeline(initial_state)` — entire LangGraph runs inline |
| `backend/agents/orchestrator_agent.py` | 282 | `await graph.ainvoke(state.model_dump())` — 9 nodes, no backgrounding |
| `frontend/config/api.ts` | 16 | `AI_TIMEOUT: 180000` — 3 minute timeout is a symptom, not a solution |
| `backend/agents/llm_client.py` | 67-68 | Each LLM call creates new `httpx.AsyncClient(timeout=60)` |

**Impact:** Server workers are tied up for 15-30 seconds per request. With 4 uvicorn workers, only ~8-16 concurrent users can be served. At scale this completely breaks down.

**Evidence of the symptom:**
```python
# backend/main.py:227-228
try:
    result = await run_pipeline(initial_state)
```
```typescript
// frontend/config/api.ts:15-16
TIMEOUT: 30000,
AI_TIMEOUT: 180000, // 3 min — full pipeline makes 6+ sequential LLM calls
```

### 2.2 Encryption is a Passthrough (Data Breach Risk)

| File | Line | Issue |
|------|------|-------|
| `backend/app/utils/encryption.py` | 10-14 | Both `encrypt_json()` and `decrypt_json()` `return data` — no encryption |
| `backend/app/routes/onboarding_route.py` | 145 | "encrypted" health data stored in plaintext |
| `backend/app/routes/retriveal_route.py` | 29 | "decrypted" data returned as-is |
| `backend/app/utils/encryption.py` | 1 | `import json` — PyNaCl imported at top but never used |

**The actual code:**
```python
# backend/app/utils/encryption.py:10-14
def encrypt_json(data: str) -> str:
    """
    Returns data as-is (no encryption applied).
    """
    return data
```

**Impact:** All user health profiles (age, conditions, diet, medical history, supplements) stored as plaintext in Supabase despite being labeled "encrypted." This is a compliance and legal liability (HIPAA/GDPR).

### 2.3 Synchronous Database Calls in Async App

| File | Line | Issue |
|------|------|-------|
| `backend/app/services/supabase.py` | 13 | `requests.post(url, json=data, headers=headers)` — synchronous, no async |
| `backend/app/services/supabase.py` | 18 | `requests.get(url, headers=headers)` — synchronous |
| `chat_sessions_route.py` | 56, 86, 110 | `req.get()`, `req.delete()`, `req.patch()` — sync in async routes |
| `onboarding_route.py` | 152, 162 | `import requests as req` + `req.patch()` — blocks event loop |

**Impact:** Synchronous `requests` calls inside async FastAPI handlers block the entire event loop. Every Supabase call pauses ALL concurrent request handling.

### 2.4 No Connection Pooling (httpx Per-Call)

| File | Line | Issue |
|------|------|-------|
| `backend/agents/llm_client.py` | 67 | `async with httpx.AsyncClient(timeout=60) as client:` — new client per LLM call |
| `backend/model_clients/base_client.py` | 79 | Same pattern — new `AsyncClient` per ML prediction |
| `backend/memory/health_memory_manager.py` | 50, 65, 106 | `async with httpx.AsyncClient(timeout=10) as client:` — Supabase calls |
| `backend/app/routes/agent_routes.py` | 100, 143 | Same pattern for history and image upload |

**Impact:** Each API call creates a new TCP connection (3-way handshake). For 8 ML models × 2 retries = ~16 TCP handshakes PER REQUEST. Connection reuse would eliminate this overhead entirely.

### 2.5 No Caching Layer

| File | Line | Issue |
|------|------|-------|
| `backend/main.py` | 119 | `_fetch_user_profile()` — called on EVERY request |
| `backend/main.py` | 311 | `_fetch_user_profile()` — called on EVERY chat message |
| `backend/main.py` | 479, 538 | Same — called on treatment generate and review |
| `backend/agents/symptoms_agent.py` | 59-68 | 8 ML model calls made fresh every time |
| `backend/agents/dravya_herb_agent.py` | 81 | Herbs ML API called fresh every request |

**Impact:** Zero cache hit rate. Every request repeats identical DB reads, ML predictions, and LLM calls. Users with the same profile queried 5 times in a session incur 5× cost and latency.

### 2.6 No Background Job System

| File | Line | Issue |
|------|------|-------|
| `backend/main.py` | 228 | Pipeline runs inline, blocking HTTP response |
| `memory/vector_store.py` | 33 | Pinecone upsert blocks the response |
| `memory/health_memory_manager.py` | 106 | Supabase insert in request path |
| `chat_sessions_route.py` | 99-118 | `upsert_chat_session()` runs synchronously in response path |

**No Celery, no Redis Queue, no FastAPI `BackgroundTasks`.** Everything blocks.

### 2.7 Single LLM Provider (No Resilience)

| File | Line | Issue |
|------|------|-------|
| `backend/agents/llm_client.py` | 50 | `url = "https://api.mistral.ai/v1/chat/completions"` — hardcoded Mistral |
| `backend/agents/llm_client.py` | 58 | `"model": settings.MODEL_NAME` — single model, no fallback |
| `backend/app/core/config.py` | 31 | `MODEL_NAME: str = os.getenv("MODEL_NAME", "mistral-large-latest")` |

**Impact:** If Mistral API is down or rate-limited, the entire application is non-functional. No fallback to OpenAI, Anthropic, or open-source models.

### 2.8 No Monitoring or Observability

| File | Line | Issue |
|------|------|-------|
| `backend/main.py` | 24 | `logging.basicConfig(level=logging.INFO)` — basic Python logging only |
| `backend/app/core/security.py` | 9-12 | Debug logging to `jwt_debug.log` file (not production-safe) |
| `backend/main.py` | 293 | `logger.error(f"Error in Orchestrator Pipeline: {e}")` — generic catch-all |
| — | — | No request ID tracing, no metrics, no structured logging |

**Impact:** Debugging production issues is blind. No way to trace a user's request through the pipeline. No way to measure latency breakdown between LLM calls, ML models, and database.

### 2.9 No Rate Limiting or Abuse Prevention

| File | Line | Issue |
|------|------|-------|
| `backend/main.py` | 30 | `allow_origins=["*"]` — CORS wide open |
| — | — | No rate limiter middleware anywhere |
| — | — | No request size limits |
| — | — | No IP-based throttling |

### 2.10 Minimal Testing

| File | Line | Issue |
|------|------|-------|
| `skin/tests/test_api.py` | All | Only test file across entire project |
| — | — | No pytest configuration |
| — | — | No test fixtures or mocks |
| — | — | No integration tests for the pipeline |

---

## 3. New Architecture — Hierarchical Orchestrator

### Concept

The **Supervisor/Worker Pattern** splits responsibilities:

- **Main Orchestrator** (Chief Medical Officer) — receives prompt, routes to sub-orchestrators, synthesizes final response
- **Models Orchestrator** (Scientist) — strictly talks to PyTorch microservices for hard mathematical facts
- **LLM Orchestrator** (Communicator) — takes raw data, turns into human-readable advice, managed by Critic loop

### Architecture Diagram

```
User Request
    │
    ▼
┌────────────────────────────────────────────────────────────────┐
│                    Main Orchestrator Agent                      │
│  • classify_intent() → which sub-orchestrators to invoke       │
│  • delegate to ML Orchestrator + LLM Orchestrator              │
│  • merge structured facts with natural language                │
│  • attach metadata: dosha, severity, pipeline_log              │
└──────┬─────────────────────────────────────┬───────────────────┘
       │                                     │
       ▼                                     ▼
┌──────────────────────────┐    ┌─────────────────────────────────┐
│   Models Orchestrator    │    │      LLM Orchestrator           │
│   (Pure PyTorch Layer)   │    │  (Multi-Model, Critic-Validated)│
│                          │    │                                 │
│   Runs ALL 8 models      │    │  1. LLM Router: classify        │
│   CONCURRENTLY:          │    │     prompt difficulty            │
│   ┌──────────────────┐   │    │  2. Route to best LLM:          │
│   │ skin_client      │   │    │     - Simple → Mistral/Llama    │
│   │ hair_client      │   │    │     - Complex → GPT-4o/Claude  │
│   │ pcos_client      │   │    │     - Critical → Ensemble Vote  │
│   │ diabetes_client  │   │    │  3. Critic Agent validates:     │
│   │ autoimmune_cl.   │   │    │     - Dosha consistency ✓       │
│   │ obesity_client   │   │    │     - Safety check ✓            │
│   │ brahma_client    │   │    │     - Completeness ✓            │
│   │ symptom_treat_cl.│   │    │  4. Loop: reject → refine       │
│   │ herbs_client     │   │    │     (max 3 iterations)          │
│   │ dietplain_client │   │    │  5. Return validated response   │
│   └──────────────────┘   │    └─────────────────────────────────┘
│   Returns: Structured    │
│   facts dictionary       │
└──────────────────────────┘
```

### New Files to Create

#### `backend/agents/ml_orchestrator.py`

```python
"""
Models Orchestrator — Pure PyTorch ML Layer

Calls ALL 8 ML microservices concurrently, returns structured facts.
No LLM calls, no synthesis. Pure data gathering.
"""

import asyncio
import logging
from typing import Any

from agents.schemas import SharedState, MLFacts
from model_clients import (
    skin_client, hair_client, pcos_client, diabetes_client,
    autoimmune_client, obesity_client, brahma_client,
    symptom_treatment_client, herbs_client, dietplain_client,
)

logger = logging.getLogger("dravya.ml_orchestrator")


async def run_ml_orchestrator(state: SharedState) -> MLFacts:
    """
    Execute all ML model calls concurrently.
    Returns structured facts dictionary (no LLM involvement).
    """
    questionnaire = _build_questionnaire(state)

    results = await asyncio.gather(
        skin_client.predict(questionnaire),
        hair_client.predict(questionnaire),
        pcos_client.predict(questionnaire),
        diabetes_client.predict(questionnaire),
        autoimmune_client.predict(questionnaire),
        obesity_client.predict(questionnaire),
        brahma_client.predict(questionnaire),
        symptom_treatment_client.predict(questionnaire),
        herbs_client.predict({"prakriti": ..., "action": ..., "top_k": 5}),
        dietplain_client.predict({"meal_type": ..., "calories": ..., ...}),
        return_exceptions=True,
    )

    return MLFacts(
        skin=_safe(results, 0),
        hair=_safe(results, 1),
        pcos=_safe(results, 2),
        diabetes=_safe(results, 3),
        autoimmune=_safe(results, 4),
        obesity=_safe(results, 5),
        brahma=_safe(results, 6),
        symptom_treatment=_safe(results, 7),
        herbs=_safe(results, 8),
        dietplain=_safe(results, 9),
        pipeline_errors=[str(r) for r in results if isinstance(r, Exception)],
    )
```

#### `backend/agents/llm_orchestrator.py`

```python
"""
LLM Orchestrator — Multi-Provider, Critic-Validated LLM Layer

Routes prompts to the best LLM provider, runs critic loop,
returns validated natural language response.
"""

import logging
from typing import Optional

from agents.schemas import SharedState, LLMResponse, CritiqueResult
from agents.llm_router import LLMRouter
from agents.llm_ensemble import LLMEnsemble
from agents.critic_agent import CriticAgent
from agents.llm_client import call_llm

logger = logging.getLogger("dravya.llm_orchestrator")


class LLMOrchestrator:
    def __init__(self):
        self.router = LLMRouter()
        self.ensemble = LLMEnsemble()
        self.critic = CriticAgent()

    async def generate(
        self, prompt: str, context: dict, max_retries: int = 3
    ) -> tuple[LLMResponse, CritiqueResult]:
        route = await self.router.classify(prompt)

        for attempt in range(max_retries):
            if route == "simple":
                response = await call_llm(prompt, context, model="mistral-large-latest")
            elif route == "complex":
                response = await call_llm(prompt, context, model="gpt-4o")
            elif route == "critical":
                response = await self.ensemble.vote(prompt, context)

            critique = await self.critic.evaluate(response, context)

            if critique.approved:
                return response, critique

            prompt = self._inject_critique(prompt, critique)
            logger.info(f"Critic rejected, retry {attempt + 1}/{max_retries}: {critique.reasons}")

        logger.warning(f"Max retries ({max_retries}) reached — returning with caveats")
        return response, critique
```

#### `backend/agents/critic_agent.py`

```python
"""
Critic Agent — Validates LLM output against Ayurvedic rules

Checks:
1. Dosha consistency — does advice match user's Prakriti?
2. Safety — herbs contraindicated with user conditions?
3. Completeness — all required sections present?
4. Accuracy — ML facts preserved in natural language output?

Returns: CritiqueResult(passed: bool, reasons: list[str])
"""

CRITIC_PROMPT = """\
You are a strict Ayurvedic quality reviewer.

Compare the LLM's response against the user's profile and ML facts.

Check:
1. DOSHA CONSISTENCY: Does the advice align with {dominant_dosha} constitution?
   - Vata: warm, grounding, oily foods. No raw/cold.
   - Pitta: cooling, mild spices. No hot/spicy/sour.
   - Kapha: light, warm, dry. No heavy/oily/sweet.

2. SAFETY: Are any herbs contraindicated for {conditions}?
   - Check each herb against known contraindications.

3. COMPLETENESS: Does the response include:
   - Dietary advice
   - Lifestyle recommendations
   - Safety disclaimer
   - Doctor consultation warning (if severity > 5)

4. ACCURACY: Does the response preserve the ML facts?
   - ML herbs mentioned: {ml_herbs}
   - ML diet items mentioned: {ml_diet}

Respond ONLY in JSON:
{
  "approved": true/false,
  "reasons": ["reason1", "reason2"],
  "fix_instructions": "What to change in the next draft"
}
"""
```

### Files to Rewrite

#### `backend/agents/orchestrator_agent.py` (New Graph)

Replace the linear graph with a hierarchical one:

```python
def _build_graph() -> StateGraph:
    g = StateGraph(SharedState)

    # Nodes
    g.add_node("classify_intent", node_classify_intent)
    g.add_node("ml_orchestrator", node_ml_orchestrator)
    g.add_node("llm_orchestrator", node_llm_orchestrator)
    g.add_node("memory_save", node_memory_save)

    g.set_entry_point("classify_intent")
    g.add_edge("classify_intent", "ml_orchestrator")
    g.add_edge("ml_orchestrator", "llm_orchestrator")

    # Conditional: critic loop inside llm_orchestrator handles its own retries
    g.add_conditional_edges(
        "llm_orchestrator",
        critic_router,
        {"memory_save": "memory_save", "llm_orchestrator": "llm_orchestrator"},
    )

    g.add_edge("memory_save", END)
    return g
```

---

## 4. Multi-LLM Orchestrator with Voting

### Concept

Not all LLMs excel at the same tasks. A Router + Ensemble architecture routes prompts optimally:

- **Simple prompts** (symptom extraction, greeting, context retrieval) → fast/cheap model (Mistral, Llama 3)
- **Complex prompts** (Ayurvedic diagnosis, personalized plan) → heavy model (GPT-4o, Claude Sonnet)
- **Critical/flagged prompts** (safety concerns, emergency) → Ensemble: 3 models vote, 4th model judges

### Implementation: `backend/agents/llm_router.py`

```python
"""
LLM Router — Classifies prompt complexity for optimal model selection.

Uses a fast, cheap LLM call to classify before routing.
No Pydantic parsing needed — simple string output.
"""

ROUTING_PROMPT = """\
Classify this user query for an Ayurvedic health assistant.
Reply with exactly one word: "simple", "complex", or "critical".

Rules:
- simple: greetings, follow-up questions, requests for clarification,
          asking about previous advice, simple symptom descriptions
- complex: detailed health analysis, personalized diet/herb plans,
           multi-symptom diagnosis, dosage recommendations
- critical: mentions of emergency, severe pain, bleeding,
            suicidal thoughts, "urgent", "emergency", "severe"
"""


class LLMRouter:
    async def classify(self, prompt: str) -> str:
        # Use a fast, cheap call (or even regex patterns) for routing
        if any(kw in prompt.lower() for kw in ["emergency", "urgent", "severe pain",
                                                "bleeding", "suicidal"]):
            return "critical"

        # For everything else, use a small model to classify
        result = await call_llm(
            ROUTING_PROMPT, prompt,
            model="mistral-small-latest",  # cheap model
            temperature=0.0,
            max_tokens=10,
        )
        result = result.strip().lower()
        return result if result in ("simple", "complex", "critical") else "complex"
```

### Implementation: `backend/agents/llm_ensemble.py`

```python
"""
LLM Ensemble — Parallel voting for critical responses.

Runs 3 models in parallel, uses a 4th model as judge to pick
the safest, most medically accurate response.
"""

import asyncio
from agents.llm_client import call_llm


class LLMEnsemble:
    MODELS = [
        "mistral-large-latest",
        "gpt-4o",
        "claude-sonnet-4-20250514",
    ]
    JUDGE_MODEL = "gpt-4o-mini"  # fast judge

    JUDGE_PROMPT = """\
You are an expert Ayurvedic medical judge.

Three AI assistants gave responses to the same user query.
Pick the response that is:
1. Most medically accurate and safe
2. Best aligned with Ayurvedic principles
3. Most complete and helpful
4. Contains proper disclaimers

User query: {prompt}

Response A: {response_a}
Response B: {response_b}
Response C: {response_c}

Reply ONLY with the letter: A, B, or C.
"""

    async def vote(self, prompt: str, context: dict) -> str:
        tasks = [
            call_llm(prompt, context, model=m)
            for m in self.MODELS
        ]
        responses = await asyncio.gather(*tasks)

        judge_prompt = self.JUDGE_PROMPT.format(
            prompt=prompt,
            response_a=responses[0],
            response_b=responses[1],
            response_c=responses[2],
        )

        winner = await call_llm(
            "Pick the best response. Reply A, B, or C only.",
            judge_prompt,
            model=self.JUDGE_MODEL,
            temperature=0.0,
            max_tokens=5,
        )

        index = {"A": 0, "B": 1, "C": 2}.get(winner.strip().upper(), 0)
        return responses[index]
```

### Configuration: `backend/app/core/config.py`

```python
# Add to Settings class:
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

LLM_ROUTING: dict = {
    "simple": "mistral-large-latest",
    "complex": "gpt-4o",
    "critical": "ensemble",  # triggers 3-model vote
}

LLM_COSTS = {
    "mistral-large-latest": 0.002,  # per 1K tokens
    "gpt-4o": 0.005,
    "claude-sonnet-4-20250514": 0.003,
    "gpt-4o-mini": 0.00015,
}
```

---

## 5. Loop Engineering — Iterative Refinement

### Concept

A **Critic Agent** validates every LLM output before it reaches the user. If validation fails, the response loops back for refinement (up to 3 iterations). This prevents:

- Diet advice that conflicts with user's Prakriti (e.g., spicy food for Pitta)
- Herbs contraindicated with user's medical conditions
- Missing safety disclaimers
- Incomplete responses

### LangGraph Loop Implementation

```python
# In orchestrator_agent.py

MAX_CRITIC_RETRIES = 3


def critic_router(state: SharedState) -> str:
    """
    After critic review, decide: accept or regenerate.
    """
    if state.critique.approved:
        return "memory_save"
    elif state.critique.retry_count >= MAX_CRITIC_RETRIES:
        logger.warning(f"Max critic retries ({MAX_CRITIC_RETRIES}) reached")
        state.pipeline_errors.append("critic: max retries exceeded")
        return "memory_save"
    else:
        state.critique.retry_count += 1
        # Inject critic feedback into context for regeneration
        state.critique_feedback = state.critique.fix_instructions
        return "llm_orchestrator"  # loop back


def _build_graph() -> StateGraph:
    g = StateGraph(SharedState)

    g.add_node("classify_intent", node_classify_intent)
    g.add_node("ml_orchestrator", node_ml_orchestrator)
    g.add_node("llm_orchestrator", node_llm_orchestrator)
    g.add_node("critic_agent", node_critic_agent)
    g.add_node("memory_save", node_memory_save)

    g.set_entry_point("classify_intent")
    g.add_edge("classify_intent", "ml_orchestrator")
    g.add_edge("ml_orchestrator", "llm_orchestrator")
    g.add_edge("llm_orchestrator", "critic_agent")

    # The loop: critic decides if we accept or regenerate
    g.add_conditional_edges(
        "critic_agent",
        critic_router,
        {
            "memory_save": "memory_save",
            "llm_orchestrator": "llm_orchestrator",  # feedback loop
        },
    )

    g.add_edge("memory_save", END)
    return g
```

### Critic Agent Implementation

See `backend/agents/critic_agent.py` in Section 3 above.

---

## 6. Data Flywheel — Feedback → Continuous Learning

### Concept

Every user response is followed by **feedback collection**. This creates a **Data Flywheel**:

```
User Response → 👍/👎 Feedback → Store in DB → Short-term: Few-shot prompting
                                                    ↓
                                              Long-term: Fine-tune custom LLM
                                                    ↓
                                         Cheaper, faster, more accurate model
```

### Database Table

```sql
-- migrations/003_feedback.sql
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_id TEXT NOT NULL,
    user_prompt TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    orchestrator_logs JSONB,          -- which models ran, latency, errors
    feedback_score SMALLINT CHECK (feedback_score IN (-1, 1)),
    feedback_text TEXT,                -- user's correction
    dosha_context JSONB,               -- prakriti, vikriti, severity at time of response
    metadata JSONB,                    -- browser, version, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_feedback_score ON feedback(feedback_score);
CREATE INDEX idx_feedback_dosha ON feedback USING gin(dosha_context);
```

### API Route: `backend/app/routes/feedback_route.py`

```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.security import verify_user

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


class FeedbackInput(BaseModel):
    session_id: str
    user_prompt: str
    ai_response: str
    feedback_score: int  # 1 or -1
    feedback_text: str = ""
    orchestrator_logs: dict = {}
    dosha_context: dict = {}


@router.post("")
async def submit_feedback(
    payload: FeedbackInput,
    user_id: str = Depends(verify_user),
):
    """Store user feedback on AI response."""
    row = {
        "user_id": user_id,
        "session_id": payload.session_id,
        "user_prompt": payload.user_prompt,
        "ai_response": payload.ai_response,
        "orchestrator_logs": payload.orchestrator_logs,
        "feedback_score": payload.feedback_score,
        "feedback_text": payload.feedback_text,
        "dosha_context": payload.dosha_context,
    }
    await insert_row("feedback", row)  # async version
    return {"status": "stored"}
```

### Few-Shot Retriever: `backend/app/services/few_shot_retriever.py`

```python
"""
Dynamic Few-Shot Prompting — Inject past successful responses as context.

When a new user asks a question, search for similar past questions
that received 👍 (feedback_score=1) and inject them as examples.

This provides immediate quality improvement without any model retraining.
"""

from app.services.supabase import supabase_client  # async version


async def get_few_shot_examples(
    user_prompt: str,
    dosha: str,
    top_k: int = 3,
) -> str:
    """Fetch top-k highly-rated responses for similar prompts."""
    # Use Supabase full-text search or vector similarity
    # For MVP: match by dosha + keyword overlap
    rows = await supabase_client.from_("feedback") \
        .select("user_prompt, ai_response") \
        .eq("feedback_score", 1) \
        .eq("dosha_context->>dominant_dosha", dosha) \
        .limit(top_k) \
        .execute()

    if not rows.data:
        return ""

    examples = []
    for r in rows.data:
        examples.append(
            f"Example Question: {r['user_prompt']}\n"
            f"Example Answer: {r['ai_response']}"
        )

    return "\n\n".join(examples)
```

### Frontend Component: `frontend/components/chat/FeedbackButtons.tsx`

```tsx
"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface FeedbackButtonsProps {
    sessionId: string;
    userPrompt: string;
    aiResponse: string;
    orchestratorLogs?: Record<string, unknown>;
    doshaContext?: Record<string, unknown>;
}

export function FeedbackButtons({
    sessionId,
    userPrompt,
    aiResponse,
    orchestratorLogs,
    doshaContext,
}: FeedbackButtonsProps) {
    const [submitted, setSubmitted] = useState<number | null>(null);
    const [showCorrection, setShowCorrection] = useState(false);
    const [correctionText, setCorrectionText] = useState("");

    const submitFeedback = async (score: number) => {
        setSubmitted(score);
        if (score === -1) {
            setShowCorrection(true);
            return;
        }

        await fetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,
                user_prompt: userPrompt,
                ai_response: aiResponse,
                feedback_score: score,
                orchestrator_logs: orchestratorLogs,
                dosha_context: doshaContext,
            }),
        });
    };

    const submitCorrection = async () => {
        await fetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,
                user_prompt: userPrompt,
                ai_response: aiResponse,
                feedback_score: -1,
                feedback_text: correctionText,
                orchestrator_logs: orchestratorLogs,
                dosha_context: doshaContext,
            }),
        });
        setShowCorrection(false);
    };

    if (submitted !== null && !showCorrection) {
        return (
            <span className="text-xs text-green-600">
                {submitted === 1 ? "Thanks for the feedback! 👍" : "Noted, we'll improve!"}
            </span>
        );
    }

    return (
        <div className="flex items-center gap-2 mt-1">
            <button
                onClick={() => submitFeedback(1)}
                className="p-1 rounded hover:bg-gray-100 transition"
                title="Good response"
            >
                <ThumbsUp className="w-4 h-4 text-gray-400 hover:text-green-600" />
            </button>
            <button
                onClick={() => submitFeedback(-1)}
                className="p-1 rounded hover:bg-gray-100 transition"
                title="Needs improvement"
            >
                <ThumbsDown className="w-4 h-4 text-gray-400 hover:text-red-600" />
            </button>

            {showCorrection && (
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={correctionText}
                        onChange={(e) => setCorrectionText(e.target.value)}
                        placeholder="What was wrong? (optional)"
                        className="text-xs border rounded px-2 py-1 w-48"
                    />
                    <button
                        onClick={submitCorrection}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                        Send
                    </button>
                </div>
            )}
        </div>
    );
}
```

### Long-Term RLHF Pipeline

```python
# scripts/train_from_feedback.py
"""
Export curated feedback data for fine-tuning a custom Ayurvedic LLM.

Run weekly:
    python scripts/train_from_feedback.py --export-dir ./training_data

This creates JSONL files for fine-tuning Llama 3 8B or Mistral 7B.
Eventually the fine-tuned model replaces the expensive GPT-4o calls.
"""

import json
from datetime import datetime, timedelta

import asyncpg


async def export_feedback_for_training(days_back: int = 7, min_score: int = 1):
    """Export highly-rated conversations as training pairs."""
    conn = await asyncpg.connect(DATABASE_URL)

    rows = await conn.fetch("""
        SELECT user_prompt, ai_response
        FROM feedback
        WHERE feedback_score >= $1
          AND created_at >= NOW() - INTERVAL '1 day' * $2
          AND feedback_text IS NULL  -- no corrections needed
        ORDER BY created_at DESC
        LIMIT 10000
    """, min_score, days_back)

    with open(f"training_data/export_{datetime.utcnow().date()}.jsonl", "w") as f:
        for row in rows:
            f.write(json.dumps({
                "messages": [
                    {"role": "user", "content": row["user_prompt"]},
                    {"role": "assistant", "content": row["ai_response"]},
                ]
            }) + "\n")

    print(f"Exported {len(rows)} training pairs")
```

---

## 7. Tech Stack Upgrade Matrix

| Area | Current | Recommended | Files Changed |
|------|---------|-------------|---------------|
| **LLM Gateway** | Direct Mistral API | `litellm` (unified multi-provider) | `agents/llm_client.py`, `core/config.py` |
| **Background Jobs** | None | `Celery` + `Redis` | `worker/celery_app.py`, `worker/tasks.py`, `main.py` |
| **Caching** | None | `Redis` + `cachetools` | `services/cache.py`, `core/config.py` |
| **Database** | Raw Supabase REST (sync) | `SQLAlchemy 2.0 async` + `asyncpg` | `services/supabase.py` → `services/database.py` |
| **Async HTTP** | Per-call httpx client | Shared `httpx.AsyncClient` pool | `agents/llm_client.py`, `model_clients/base_client.py` |
| **Monitoring** | Basic logging | `OpenTelemetry` + `Prometheus` | `core/telemetry.py`, `middleware.py` |
| **Rate Limiting** | None | `slowapi` | `main.py`, `core/security.py` |
| **Encryption** | Passthrough | `PyNaCl` (XSalsa20-Poly1305) | `utils/encryption.py` |
| **File Storage** | URL-only | `S3` / `MinIO` (via `boto3`) | `services/storage.py` |
| **API Streaming** | REST only | `SSE` / `WebSocket` for token streaming | `routes/stream_route.py` |
| **Containerization** | Manual script | `Docker Compose` | Root `docker-compose.yml`, per-service Dockerfile |
| **Testing** | 1 test file | `pytest` + `pytest-asyncio` + `respx` | `tests/` directory |
| **Python Linting** | None | `ruff` | `pyproject.toml` |
| **CI/CD** | None | `GitHub Actions` | `.github/workflows/` |

---

## 8. Full File Change Inventory

### Files to DELETE

| File | Reason |
|------|--------|
| `backend/app/utils/encryption.py` | Replace with real encryption |
| `backend/app/services/supabase.py` | Replace with SQLAlchemy async |
| `backend/agents/prakriti_agent.py` | Logic absorbed into LLM Orchestrator |
| `backend/agents/vikriti_agent.py` | Logic absorbed into LLM Orchestrator |
| `backend/agents/dravya_herb_agent.py` | Logic absorbed into ML Orchestrator + assistant prompt |
| `backend/agents/ahara_agent.py` | Logic absorbed into ML Orchestrator + assistant prompt |

### Files to CREATE (New)

| File | Purpose |
|------|---------|
| `backend/agents/ml_orchestrator.py` | Concurrent PyTorch model execution |
| `backend/agents/llm_orchestrator.py` | Multi-LLM routing + critic loop |
| `backend/agents/llm_router.py` | Prompt difficulty classifier |
| `backend/agents/llm_ensemble.py` | 3-model voting with judge |
| `backend/agents/critic_agent.py` | Ayurvedic output validator |
| `backend/app/services/cache.py` | Redis caching layer |
| `backend/app/services/database.py` | SQLAlchemy async engine + models |
| `backend/app/services/few_shot_retriever.py` | Dynamic few-shot from feedback DB |
| `backend/app/services/storage.py` | S3/MinIO file storage |
| `backend/app/routes/feedback_route.py` | Feedback capture API |
| `backend/app/routes/stream_route.py` | SSE/WebSocket streaming |
| `backend/worker/celery_app.py` | Celery configuration |
| `backend/worker/tasks.py` | Background pipeline task |
| `backend/Dockerfile` | Container image |
| `docker-compose.yml` | Multi-service orchestration |
| `supabase/migrations/003_feedback.sql` | Feedback table migration |
| `frontend/components/chat/FeedbackButtons.tsx` | Feedback UI |
| `.github/workflows/ci.yml` | CI pipeline |
| `.github/workflows/deploy.yml` | CD pipeline |
| `pyproject.toml` | Ruff + pytest config |
| `tests/test_api.py` | API integration tests |
| `tests/test_pipeline.py` | Pipeline integration tests |
| `tests/test_critic.py` | Critic agent unit tests |
| `tests/conftest.py` | Shared test fixtures |

### Files to REWRITE (Major)

| File | Change Summary |
|------|----------------|
| `backend/main.py` | Add middleware stack (rate limit, telemetry, CORS hardening), replace inline pipeline with background task |
| `backend/agents/orchestrator_agent.py` | Replace linear graph with hierarchical (classify → ML → LLM → Critic → loop) |
| `backend/agents/llm_client.py` | Replace direct Mistral API with `litellm` unified interface |
| `backend/agents/schemas.py` | Add `MLFacts`, `LLMResponse`, `CritiqueResult`, `CritiqueFeedback` models |
| `backend/agents/safety_agent.py` | Simplify to pure rule-based checks (ML-driven, no LLM needed) |
| `backend/app/core/config.py` | Add LLM provider keys, routing config, Redis/S3 config |
| `backend/app/core/security.py` | Add rate limiting integration |
| `backend/memory/vector_store.py` | Make async, add connection pooling |
| `backend/memory/health_memory_manager.py` | Make async, use shared httpx client |
| `backend/model_clients/base_client.py` | Use shared httpx client pool, add circuit breaker |

### Files to UPDATE (Minor)

| File | Change |
|------|--------|
| `backend/app/routes/onboarding_route.py` | Use async DB, log feedback metadata |
| `backend/app/routes/chat_sessions_route.py` | Use async DB |
| `backend/app/routes/agent_routes.py` | Use async DB, add error context |
| `backend/app/routes/health_route.py` | Add dependency health check aggregation |
| `frontend/config/api.ts` | Add `FEEDBACK` and `STREAM` endpoints |
| `frontend/lib/ai-service.ts` | Add `submitFeedback()` method |
| `start.command` | Replace with `docker-compose up` instruction |

---

## 9. Phased Implementation Roadmap

### Phase 1 — Quick Wins (2-3 days)

**Goal:** Fix critical security issues, add dev tooling, containerize

| Task | Files | Effort |
|------|-------|--------|
| 1. Add `ruff` config + run | `pyproject.toml` | 30 min |
| 2. Add `pytest` + basic health tests | `tests/`, `pyproject.toml` | 2 hr |
| 3. Docker Compose setup | `docker-compose.yml`, `backend/Dockerfile` | 3 hr |
| 4. Fix encryption (use PyNaCl) | `utils/encryption.py` | 1 hr |
| 5. Reuse httpx client (singleton) | `agents/llm_client.py`, `model_clients/base_client.py` | 1 hr |
| 6. Add `slowapi` rate limiter | `main.py`, `core/security.py` | 30 min |
| 7. Add GitHub Actions CI | `.github/workflows/ci.yml` | 1 hr |

**Total:** ~9 hours

### Phase 2 — Core Performance (1 week)

**Goal:** Cache, background jobs, proper database access

| Task | Files | Effort |
|------|-------|--------|
| 1. Redis cache for profiles/LLM/ML | `services/cache.py`, `core/config.py` | 4 hr |
| 2. Celery + Redis background pipeline | `worker/`, `main.py` | 6 hr |
| 3. SQLAlchemy async + asyncpg | `services/database.py`, all routes | 8 hr |
| 4. Replace sync `requests` → async `httpx` | All route files, services | 4 hr |
| 5. WebSocket/SSE token streaming | `routes/stream_route.py` | 4 hr |
| 6. Phase 1 → background migration | Update frontend to poll/websocket | 3 hr |

**Total:** ~29 hours

### Phase 3 — Intelligence (3-4 days)

**Goal:** Multi-LLM routing, critic loop, feedback flywheel

| Task | Files | Effort |
|------|-------|--------|
| 1. `litellm` integration | `agents/llm_client.py` | 3 hr |
| 2. LLM Router | `agents/llm_router.py` | 2 hr |
| 3. LLM Ensemble (voting) | `agents/llm_ensemble.py` | 3 hr |
| 4. Critic Agent | `agents/critic_agent.py` | 4 hr |
| 5. Hierarchical orchestrator graph | `agents/orchestrator_agent.py` (rewrite) | 6 hr |
| 6. Feedback API + DB | `routes/feedback_route.py`, migration | 2 hr |
| 7. Few-shot retriever | `services/few_shot_retriever.py` | 2 hr |
| 8. Frontend feedback UI | `FeedbackButtons.tsx` | 2 hr |

**Total:** ~24 hours

### Phase 4 — Scale & Polish (1 week)

**Goal:** Monitoring, storage, hardening, RLHF pipeline

| Task | Files | Effort |
|------|-------|--------|
| 1. OpenTelemetry + Prometheus | `core/telemetry.py`, `middleware.py` | 6 hr |
| 2. S3/MinIO file storage | `services/storage.py`, routes | 4 hr |
| 3. Pagination on all list endpoints | Route files | 2 hr |
| 4. Error standardization (Problem Details RFC) | `core/errors.py` | 2 hr |
| 5. Load testing (locust/k6) | `tests/load/` | 4 hr |
| 6. RLHF export script | `scripts/train_from_feedback.py` | 3 hr |
| 7. GitHub Actions deploy | `.github/workflows/deploy.yml` | 2 hr |

**Total:** ~23 hours

---

## 10. Estimated Performance Gains

| Metric | Current | After Phase 1-2 | After Full Rewrite |
|--------|---------|-----------------|-------------------|
| **API response time** (p50) | 15-30s | 200-500ms (queue + poll) | < 100ms (WebSocket streaming) |
| **Pipeline completion** | 15-30s inline | 15-30s background | 8-15s (optimized critic loop) |
| **LLM cost/request** | $0.02 (Mistral only) | $0.02 | $0.005-0.02 (smart routing: 80% simple, 20% complex) |
| **Cache hit rate** | 0% | ~40% | ~60%+ (profile + ML results + common queries) |
| **Requests/sec** (4 workers) | ~8-16 | ~50-100 (background) | ~200+ (async everything) |
| **Test coverage** | <1% | ~30% | ~70%+ |
| **LLM uptime** | Single provider | Single provider | 99.99% (3 providers with failover) |
| **Data security** | Plaintext | ✅ XSalsa20-Poly1305 | ✅ + Audit logging |
| **Deployment** | Manual | Docker Compose | Docker Compose + CI/CD |

---

## Appendix A: Environment Configuration

### New `.env` additions

```bash
# === MULTI-LLM PROVIDERS ===
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# === REDIS ===
REDIS_URL=redis://localhost:6379/0

# === STORAGE ===
S3_ENDPOINT=http://localhost:9000    # MinIO for dev
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=dravya-uploads

# === MONITORING ===
OTEL_SERVICE_NAME=dravya-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### Docker Compose services

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"

  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [redis, minio]
    env_file: ./backend/.env

  celery-worker:
    build: ./backend
    command: celery -A worker.celery_app worker --loglevel=info
    depends_on: [redis]
    env_file: ./backend/.env

  brahma:    # ML microservice
    build: ./brahma
    ports: ["8005:8005"]

  herbs:     # ML microservice
    build: ./herbs
    ports: ["8002:8002"]

  dietplain: # ML microservice
    build: ./dietplain
    ports: ["8004:8004"]

  # ... remaining ML microservices
```

---

## Appendix B: Priority Decision Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Fix encryption (passthrough) | 🔴 Security | 1 hr | **P0** |
| Redis caching | 🟢 Performance | 4 hr | **P0** |
| Background Celery jobs | 🟢 Performance | 6 hr | **P0** |
| Docker Compose | 🟢 DevOps | 3 hr | **P0** |
| Multi-LLM routing | 🟡 Resilience | 5 hr | **P1** |
| Critic loop | 🟡 Quality | 4 hr | **P1** |
| Feedback flywheel | 🟡 Learning | 4 hr | **P1** |
| SQLAlchemy async | 🟢 Performance | 8 hr | **P1** |
| OpenTelemetry | 🟡 Observability | 6 hr | **P2** |
| S3 file storage | 🟡 Feature | 4 hr | **P2** |
| CI/CD | 🟢 DevOps | 3 hr | **P2** |
| WebSocket streaming | 🟡 UX | 4 hr | **P2** |
| RLHF training pipeline | 🔵 Moonshot | 3 hr | **P3** |
| Load testing | 🟡 Quality | 4 hr | **P3** |

---

*End of Report*
