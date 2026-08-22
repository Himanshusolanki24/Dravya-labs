-- ============================================================
-- Dravya Labs — run once in Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS)
-- ============================================================

-- ── public.users (profile row, id = auth.users.id) ──────────
CREATE TABLE IF NOT EXISTS public.users (
    id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email                TEXT UNIQUE,
    full_name            TEXT,
    first_name           TEXT,
    last_name            TEXT,
    age                  INTEGER,
    gender               TEXT,
    location             TEXT,
    phone                TEXT,
    date_of_birth        DATE,
    avatar_url           TEXT,
    bio                  TEXT,
    blood_group          TEXT,
    height_cm            NUMERIC,
    weight_kg            NUMERIC,
    dietary_preference   TEXT,
    dosha_type           TEXT,
    health_goals         TEXT[],
    is_profile_complete  BOOLEAN NOT NULL DEFAULT false,
    role                 TEXT NOT NULL DEFAULT 'USER',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Auto-create profile when a user signs up (email or Google).
-- Must never raise: Auth returns HTTP 500 unexpected_failure if this trigger fails.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, first_name, last_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, public.users.email),
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.users.avatar_url),
        updated_at = timezone('utc', now());
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Same email already on another profile row — still allow Auth user to exist
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user failed: %', SQLERRM;
        RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role, supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT INSERT, UPDATE ON TABLE public.users TO supabase_auth_admin, postgres, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();

-- ── Health / chat / analysis ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_health_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_health_json TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Untitled Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.analysis_history (
    analysis_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID,
    result_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.user_health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own health profiles" ON public.user_health_profiles;
CREATE POLICY "Users can manage own health profiles"
    ON public.user_health_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can manage own chat sessions"
    ON public.chat_sessions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own analysis history" ON public.analysis_history;
CREATE POLICY "Users can manage own analysis history"
    ON public.analysis_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ── Saved items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'unknown',
    name TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_items_user ON public.saved_items (user_id);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved items" ON public.saved_items;
DROP POLICY IF EXISTS "Users can insert their own saved items" ON public.saved_items;
DROP POLICY IF EXISTS "Users can delete their own saved items" ON public.saved_items;

CREATE POLICY "Users can view their own saved items"
    ON public.saved_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved items"
    ON public.saved_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items"
    ON public.saved_items FOR DELETE
    USING (auth.uid() = user_id);

-- ── Feedback ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id        TEXT NOT NULL,
    user_prompt       TEXT NOT NULL,
    ai_response       TEXT NOT NULL,
    orchestrator_logs JSONB DEFAULT '{}'::jsonb,
    feedback_score    SMALLINT NOT NULL CHECK (feedback_score IN (-1, 1)),
    feedback_text     TEXT,
    dosha_context     JSONB DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_feedback_user  ON public.feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_score ON public.feedback (feedback_score);
CREATE INDEX IF NOT EXISTS idx_feedback_dosha ON public.feedback USING gin (dosha_context);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;

CREATE POLICY "Users can insert own feedback"
    ON public.feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
    ON public.feedback FOR SELECT
    USING (auth.uid() = user_id);

-- ── LLM usage snapshots ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.llm_usage (
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day         DATE NOT NULL,
    league      TEXT NOT NULL CHECK (league IN ('high', 'medium', 'low')),
    requests    INTEGER NOT NULL DEFAULT 0,
    tokens      INTEGER NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (user_id, day, league)
);

CREATE INDEX IF NOT EXISTS idx_llm_usage_user_day ON public.llm_usage (user_id, day);

ALTER TABLE public.llm_usage ENABLE ROW LEVEL SECURITY;
-- Backend service_role bypasses RLS; no client policies needed.
