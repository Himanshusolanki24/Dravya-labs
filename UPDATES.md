# Dravya Labs — Session Updates (16 Aug 2026)

This note records the product and platform work landed in the current session: multi-provider LLM leagues with daily quotas, chat skills + MCP + Caveman mode, and OpenUI generative interfaces.

---

## 1. LLM leagues, reasoning picker, daily quotas

Chat no longer hard-codes a single model. Calls go through a **High / Medium / Low** league with provider fallback and per-user daily **request + token** caps.

### Leagues (first entry preferred)

| League | Intent | Default chain |
|--------|--------|----------------|
| **High** | Deep reasoning | `openai:gpt-5.6` → `xai:grok-4.5` → OpenRouter Grok → `anthropic:claude-sonnet-4-5` → OpenRouter GPT |
| **Medium** | Balanced | `groq:mistral-saba-24b` → Mistral Small → Gemini 2.5 Flash → OpenRouter Mistral |
| **Low** | Fast / cheap | Groq Llama 3.3 70B → DeepSeek → Mistral Small → OpenRouter Llama |

A provider is skipped when its API key is missing, or on HTTP 429/5xx. If the requested league is exhausted, the resolver **downgrades** (High → Medium → Low). **429** only when every league is spent.

### Daily caps (UTC)

- High: 20 requests / 80k tokens
- Medium: 50 requests / 200k tokens
- Low: 100 requests / 400k tokens

Live limiter: Redis hash `llm:quota:{user_id}:{YYYY-MM-DD}`. Optional history table: `backend/migrations/004_llm_usage.sql`.

### Chat UI

Segmented **High / Medium / Low** on the composer (persisted in `localStorage`). Quota remaining and a downgrade note (e.g. “switched to Medium — High daily limit reached”) show after replies.

Analyze / agents still map simple → low, complex → medium, critical → high (ensemble uses High-league providers). Chat uses the picker, not auto-classify.

### APIs

- `POST /api/chat` — `league`, response fields `league_requested`, `league_used`, `model_used`, `downgraded`, `usage`
- `GET /api/llm/leagues` — catalog + remaining quota (JWT)
- Analyze accepts `league` on the first message

### Main files

- `backend/agents/llm_client.py` — OpenAI, Anthropic, Mistral, Groq, xAI, Gemini, DeepSeek, OpenRouter (`provider:model` ids + token usage)
- `backend/agents/llm_leagues.py` — catalog + `resolve_call`
- `backend/app/services/llm_quota.py`
- `backend/tests/test_llm_leagues.py`

Env keys: `GROQ_API_KEY`, `XAI_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY`, plus `LLM_*_CHAIN` and `LLM_*_DAILY_*` in `backend/.env.example`.

---

## 2. MCP connectors, user skills, Caveman mode

### Cursor MCP (developer)

`.cursor/mcp.json` registers:

- **Notion** (`@notionhq/notion-mcp-server`)
- **Obsidian** (`mcp-obsidian`, Local REST API)
- **Dravya knowledge vault** (filesystem → `backend/knowledge`)
- **GitHub**
- **Fetch** (web)

Fill tokens in that file (and matching vars in `.env.example`), then reload MCP in Cursor. Obsidian needs the Local REST API plugin on `127.0.0.1:27124`.

### In-app chat tools (end user)

The **+** control on the composer opens **Chat tools**:

- **Skills** — Diet coach, Herb protocol, PCOS/cycle, plus custom skills. Enabled skills are injected into every analyze/chat turn.
- **MCP** — Notion integration token, Obsidian URL + API key, toggle for the local Ayurveda vault. Tokens are encrypted server-side (`PUT /api/chat/tools`) and never echoed back.
- Settings also persist in `localStorage` (`dravya-chat-tools`).

### Caveman

A **Caveman** chip sits next to High/Medium/Low. It shortens the system prompt, trims retrieved context, and caps completions (512 tokens) so answers cost less.

### APIs / files

- `GET/PUT /api/chat/tools`
- `backend/app/mcp/providers.py` — Notion / Obsidian / knowledge search at chat time
- `backend/app/mcp/caveman.py`
- `backend/app/services/chat_settings.py`
- `frontend/components/chat/chat-tools-sheet.tsx`, `frontend/hooks/useChatTools.ts`

---

## 3. OpenUI generative UI

Analysis, chat, and treatment output can render as **structured, interactive UI** (OpenUI Lang + `@openuidev/react-ui` `Renderer`) instead of a markdown-only bubble.

### Behavior

- **Consultation (analyze)** is compiled into OpenUI: safety callout, Vata/Pitta/Kapha radar, tabs (Overview / Herbs / Diet / Lifestyle), tables, follow-up chips. Follow-ups send the next user message.
- **Chat** is instructed to emit OpenUI Lang. Plain text is wrapped in a `Card` + `MarkDownRenderer` so the renderer still works.
- **Treatment plans** get a donut of task categories and day-by-day `Steps`, above the existing checklist.

### APIs

New optional field `openui` on:

- `AnalysisResult`
- `ChatResponse`
- `TreatmentPlanModel`

### Main files

- `backend/app/openui/__init__.py` — compact OpenUI Lang instructions
- `backend/app/openui/compile.py` — `analysis_to_openui`, `treatment_to_openui`, `wrap_openui`
- `frontend/lib/openui/openui-view.tsx`
- `backend/tests/test_openui.py`

Frontend packages: `@openuidev/react-lang`, `@openuidev/react-ui`, `@openuidev/lang-core`, `zod`.

---

## How to try it

1. Copy `backend/.env.example` → `.env` and add at least one LLM key (Mistral, Groq, or OpenRouter is enough to fall through leagues).
2. Run Redis if you want shared quotas; otherwise in-memory fallback is used.
3. Start backend + Next.js frontend.
4. Open **Chat**: pick High/Medium/Low, optionally **Caveman**, open **+** for skills/MCP.
5. Send a first message — the analysis should appear as an interactive OpenUI card (charts/tabs), not only prose.
6. Start a treatment plan from a moderate/urgent consult to see the OpenUI treatment dashboard.

---

## Tests

```bash
cd backend
python -m unittest tests.test_llm_leagues tests.test_chat_tools tests.test_openui tests.test_agentscope_runtime -v
```
