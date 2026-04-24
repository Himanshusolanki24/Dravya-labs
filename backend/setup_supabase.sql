-- 1. user_health_profiles
-- Stores encrypted health data for users.
CREATE TABLE IF NOT EXISTS public.user_health_profiles (
    user_id UUID PRIMARY KEY,
    encrypted_health_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. chat_sessions
-- Metadata for user chat threads.
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT DEFAULT 'Untitled Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. analysis_history
-- Snapshots of AI analysis results.
CREATE TABLE IF NOT EXISTS public.analysis_history (
    analysis_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id UUID,
    result_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Basic - Enable all for service role, restrict others)
ALTER TABLE public.user_health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Note: In a production app, you would add policies for authenticated users 
-- matching their auth.uid(). For now, we assume service_role access from backend.
