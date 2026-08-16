-- Daily LLM usage snapshot (Redis remains the live limiter).
CREATE TABLE IF NOT EXISTS public.llm_usage (
    user_id     UUID NOT NULL,
    day         DATE NOT NULL,
    league      TEXT NOT NULL CHECK (league IN ('high', 'medium', 'low')),
    requests    INTEGER NOT NULL DEFAULT 0,
    tokens      INTEGER NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (user_id, day, league)
);

CREATE INDEX IF NOT EXISTS idx_llm_usage_user_day ON public.llm_usage (user_id, day);

ALTER TABLE public.llm_usage ENABLE ROW LEVEL SECURITY;
