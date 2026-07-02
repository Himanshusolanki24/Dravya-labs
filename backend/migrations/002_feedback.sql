-- ============================================================
-- Data Flywheel: feedback table
-- Run in the Supabase SQL editor (or psql) once.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.feedback (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL,
    session_id        TEXT NOT NULL,
    user_prompt       TEXT NOT NULL,
    ai_response       TEXT NOT NULL,
    orchestrator_logs JSONB DEFAULT '{}'::jsonb,   -- which models ran, latency, errors
    feedback_score    SMALLINT NOT NULL CHECK (feedback_score IN (-1, 1)),
    feedback_text     TEXT,                         -- optional user correction
    dosha_context     JSONB DEFAULT '{}'::jsonb,    -- prakriti/vikriti/severity at answer time
    created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Fast lookups for the few-shot retriever and RLHF export
CREATE INDEX IF NOT EXISTS idx_feedback_user   ON public.feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_score  ON public.feedback (feedback_score);
CREATE INDEX IF NOT EXISTS idx_feedback_dosha  ON public.feedback USING gin (dosha_context);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
-- Backend uses the service_role key, which bypasses RLS.
-- Add an authenticated-user policy here if the frontend ever writes directly.
