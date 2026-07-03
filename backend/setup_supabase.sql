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

-- 4. saved_items
-- Saved herbs or treatments for users.
CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'unknown',
    name TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, item_id)
);

-- RLS Policies (Basic - Enable all for service role, restrict others)
ALTER TABLE public.user_health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_items (Client/Frontend accessible)
CREATE POLICY "Users can view their own saved items" 
    ON public.saved_items 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved items" 
    ON public.saved_items 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items" 
    ON public.saved_items 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Note: In a production app, you would add policies for authenticated users 
-- matching their auth.uid(). For now, we assume service_role access from backend.

