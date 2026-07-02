# Dravya Labs Backend Analysis Report

## 1. Scope of analysis

This report covers the current Python backend in `Dravya-labs/backend` and the associated microservice integration pattern in this repository.

Analyzed files and areas:
- `backend/main.py`
- `backend/app/core/config.py`
- `backend/app/core/security.py`
- `backend/app/routes/*`
- `backend/agents/*`
- `backend/memory/*`
- `backend/model_clients/*`
- `backend/app/services/*`
- `backend/requirement.txt`
- `backend/app/routes/onboarding_route.py`

The system also depends on separate model microservice folders under `Dravya-labs/` such as `herbs/`, `brahma/`, `Autoimmune/`, `dietplain/`, `diabetes/`, `symptom_treatment/`, etc.

## 2. Current backend architecture

### 2.1 Overall design

The main backend is a FastAPI application that acts as an orchestrator for:
- user profile storage and retrieval
- chat interaction handling
- symptom analysis through a multi-agent pipeline
- treatment plan generation
- session tracking

It also integrates with:
- Supabase PostgREST for storage (`user_health_profiles`, `chat_sessions`, `analysis_history`)
- Pinecone for vector memory
- Mistral LLM via direct API calls
- multiple external ML microservices via HTTP API clients

### 2.2 Pipeline architecture

A `langgraph` state graph is used to orchestrate a linear pipeline:
1. memory retrieval
2. symptoms agent
3. prakriti agent
4. vikriti agent
5. dravya (herb) agent
6. ahara (diet) agent
7. safety agent
8. orchestrator synthesis
9. memory save

The pipeline returns a structured `GeneratePlanResponse`.

### 2.3 Microservice pattern

The orchestrator calls multiple external model services through `backend/model_clients/*.py` clients.
These clients are all subclasses of `BaseModelClient` and use HTTP POST to service URLs defined in environment variables.

Parallel inference is implemented inside `agents/symptoms_agent.py` using `asyncio.gather`, which is a positive design choice.

## 3. Key findings

### 3.1 Strengths

- FastAPI-based service is appropriate for a modern Python backend.
- Asynchronous design is used in many places: `httpx.AsyncClient`, FastAPI endpoints, agent calls.
- The `langgraph` pipeline provides a clear multi-agent orchestration model.
- External model calls are largely isolated behind clients, making them easier to swap.
- The `agents/symptoms_agent.py` uses concurrent model inference, which reduces end-to-end latency for that stage.
- `pydantic` models and typed state objects are used consistently.
- There is a strong emphasis on safety, with a dedicated safety agent and explicit safety prompts.

### 3.2 Major structural issues

1. **Inconsistent async/sync HTTP usage**
   - `app/services/supabase.py` uses synchronous `requests` in an async FastAPI backend.
   - `backend/app/routes/chat_sessions_route.py` and `onboarding_route.py` also use `requests` or `req` directly.
   - This can block the async event loop under load and reduce concurrency severely.

2. **Duplicate / inconsistent Pinecone integration**
   - There are at least two Pinecone helper modules: `backend/app/services/pinecone.py` and `backend/memory/vector_store.py`.
   - They use different index names and different initialization strategies.
   - Some code imports `app.services.pinecone` while other code imports `app.services.pinecone_service` or `backend/memory/vector_store.py`.

3. **Missing/broken imports**
   - `app/routes/health_route.py` and `app/routes/retriveal_route.py` import `app.services.supabase_api`, but the workspace only contains `app/services/supabase.py`.
   - This indicates either missing files or stale imports.

4. **Direct use of Supabase service role key**
   - Many routes and helpers use the Supabase service role key in backend-to-backend REST calls.
   - This is convenient, but it raises security risk if any endpoint leaks or if the service role is stored insecurely.

5. **Monolithic backend with legacy route mixing**
   - `backend/main.py` contains route logic plus shared helper functions and business logic.
   - Legacy router import logic and endpoint definitions are mixed in one file, increasing maintenance burden.

6. **No shared HTTP client / connection pooling**
   - `httpx.AsyncClient` is created per request in many places.
   - This wastes resources and prevents connection reuse.

7. **Data access is REST-heavy and unoptimized**
   - Every read/write uses individual REST calls to Supabase.
   - No batch fetching, no RPC calls, no caching layer.

8. **No metrics / resilience observability**
   - There is logging, but no structured metrics, no tracing, and no request latency instrumentation.

9. **Hard-coded model prompt behaviors**
   - Many agents depend on exact JSON from the LLM and perform brittle parsing.
   - This will create flakiness as prompt outputs vary.

10. **Potential security gaps**
   - `chat_sessions_route` is unauthenticated.
   - `verify_user()` falls back to JWT decoding without audience validation if the first verify fails.

## 4. Performance bottlenecks

### 4.1 Blocking I/O in async routes

The backend currently mixes synchronous `requests` calls with async endpoints. This is the biggest immediate performance problem.

Example:
- `fetch_row_by_id` in `app/services/supabase.py`
- `insert_row` in `app/services/supabase.py`
- `chat_sessions_route` route handlers
- `onboarding_route` update/insert operations

### 4.2 External API latency

The pipeline depends on multiple external endpoints:
- Mistral LLM API
- Pinecone embeddings/query
- Supabase REST
- model microservices (`HERBS_MODEL_API_URL`, `BRAHMA_MODEL_API_URL`, etc.)

Each of these external dependencies adds latency and failure risk. There is no centralized timeout policy or caching layer.

### 4.3 Duplicate memory and vector operations

- Memory retrieval and saving calls Pinecone multiple times with separate embedding generation.
- The same `Pinecone` client is constructed repeatedly.
- This duplication increases runtime and makes debugging harder.

### 4.4 Linear pipeline with optional parallelism

The agent graph is mostly linear:
- symptoms → prakriti → vikriti → dravya → ahara → safety → synthesis.

Although the symptoms agent itself does parallel inference, other stages are strictly sequential. Some stages could run in parallel or be reorganized to reduce latency.

### 4.5 Unoptimized prompt and response handling

- Some agent prompts send large data dumps in plain text.
- The pipeline may be sending large JSON strings to LLM multiple times.
- This increases tokens and therefore cost/latency.

## 5. Stability and correctness risks

### 5.1 Broken import references

If `app.services.supabase_api` is missing, endpoints will fail at service startup.

### 5.2 Hardcoded index names & environment drift

`PINECONE_INDEX` and `PINECONE_MEMORY_INDEX` exist, but vector store code hardcodes `pc.Index("dravya-labs")`.
This makes deployment inconsistent.

### 5.3 No centralized error handling

While pipeline nodes catch some exceptions, many routes simply raise raw errors from dependencies.
This can leak implementation details and make error behavior inconsistent.

### 5.4 Incomplete authorization

`verify_user` is used in some routers, but not all. `chat_sessions_route` and some health routes do not authenticate the caller.

## 6. Recommended backend improvements

### 6.1 Immediate fixes (quick wins)

- Replace all synchronous `requests` usage with `httpx.AsyncClient`.
- Centralize Supabase access in one async helper module and remove duplicate service functions.
- Fix the missing `supabase_api` import or standardize around `supabase.py`.
- Consolidate Pinecone integration into a single helper module with one index configuration.
- Use a shared `httpx.AsyncClient` instance for service calls instead of creating one per function.
- Add a simple Redis or in-memory cache for repeated `fetch_row_by_id` and memory retrievals.

### 6.2 Backend architecture improvements

- Refactor `backend/main.py` to keep only FastAPI app setup and router inclusion.
- Move route definitions into separate modules, with business logic in services.
- Ensure the orchestrator pipeline is isolated behind one service layer.
- Standardize on `async def` throughout the backend and avoid mixing sync/async.

### 6.3 Performance optimizations

- Add a caching layer for user profile reads and frequently accessed Supabase rows.
- Add request-level timeouts and circuit breakers for external model APIs.
- Use `asyncio.gather` for any independent pipeline stages that can safely run in parallel.
- Reduce LLM token usage by compressing prompts and curating only required fields.
- If Pinecone is only used for user memory, consider storing embeddings in Supabase using `pgvector` or migrating to a single vector database with lower latency/cost.

### 6.4 Reliability improvements

- Introduce retry policies and fallback behavior for each external microservice.
- Add structured logs for critical routes and pipeline nodes.
- Add health endpoints for each external dependency: LLM, Supabase, Pinecone, microservices.
- Add tests for critical backend endpoints and service helpers.

### 6.5 Security and alignment

- Remove direct service role usage from any client-facing route unless strictly necessary.
- Add authentication to all stateful routes.
- Harden JWT verification by removing the fallback path or limiting it to known safe cases.

## 7. Recommended technologies

### 7.1 Core backend
- Keep `FastAPI` as the framework.
- Use `uvicorn` or `gunicorn` with `uvicorn.workers.UvicornWorker` for production.
- Use `httpx` for all async HTTP.
- Use `pydantic` v2 patterns consistently.
- Consider `SQLAlchemy 2.0` / `asyncpg` if you move away from Supabase REST to direct DB.

### 7.2 Data store and memory
- Continue using Supabase if you want managed Postgres + auth.
- For vector search, consider:
  - Pinecone if cost and SLA are acceptable,
  - or `Qdrant` / `pgvector` if you want simpler self-hosted storage and lower latency.
- Add Redis for caching and session/lengthy request coordination.

### 7.3 LLM and inference
- Keep the direct Mistral API wrapper, but add a prompt manager and caching for standard queries.
- Consider using a single multi-task model service for model inference instead of 5+ separate microservices.
- Optionally use model-serving frameworks such as `FastAPI + BentoML` or `KServe` for internal microservices.

### 7.4 Observability
- Add Prometheus metrics via `prometheus-client`.
- Add distributed tracing via OpenTelemetry (`opentelemetry-sdk`).
- Add structured logs using JSON format and request ids.

## 8. Recommended optimization roadmap

### Phase 1 — Stabilize and fix
1. Fix broken service imports and Pinecone index inconsistencies.
2. Convert all blocking I/O to async.
3. Centralize external service clients.
4. Add endpoint authentication coverage.

### Phase 2 — Optimize performance
1. Add caching for Supabase profile and memory calls.
2. Centralize and reuse `httpx.AsyncClient`.
3. Add request/operation timeouts and retries.
4. Parallelize independent pipeline branches.

### Phase 3 — Harden reliability
1. Add observability and metrics.
2. Implement DB-backed session/state caching.
3. Move from manual Supabase REST calls to a proper backend SDK or direct async DB access if needed.

### Phase 4 — Scale and reduce cost
1. Evaluate vector DB consolidation or cheaper alternatives (`pgvector`, `Qdrant`).
2. Evaluate moving microservice model inference into fewer services or one shared inference service.
3. Add result caching for repeated symptom analysis queries.

## 9. Specific backend notes

### 9.1 `backend/main.py`
- This file contains both legacy routers and modern endpoint handlers.
- It includes a full symptom analysis endpoint that fetches Supabase profile, builds a state object, runs the pipeline, and writes chat session metadata.
- The `chat` endpoint does memory retrieval, profile enrichment, LLM call, memory save, and chat session upsert in a single request.

### 9.2 `app/services/supabase.py`
- Uses synchronous `requests` for all Supabase access.
- Only supports `insert_row` and `fetch_row_by_id`.
- Does not support patch/upsert or query paging.

### 9.3 `memory/vector_store.py`
- Uses Pinecone inference embedding directly inside the vector helper.
- Hardcodes index name `dravya-labs`.
- Does not share the same index configuration as `app/services/pinecone.py`.

### 9.4 `app/routes/onboarding_route.py`
- Encrypts profiles and stores anonymized embeddings in Pinecone.
- Uses `requests` for Supabase patch updates.
- This route is a good candidate for refactor and async conversion.

### 9.5 `agents/*`
- Agent prompts are large and sometimes depend on exact JSON structure.
- Models are called repeatedly with unnormalized state, which can increase token usage.

## 10. Conclusions

The backend is functional and follows a strong agent-oriented concept, but it is currently held back by implementation inconsistencies, blocking I/O, duplicate service modules, and fragile external dependency handling.

By fixing the async/sync mix, centralizing service clients, consolidating Pinecone usage, and adding caching plus observability, this backend can become significantly faster, more reliable, and easier to maintain.

---

> File created: `Dravya-labs/backend/backend_analysis_report.md`
