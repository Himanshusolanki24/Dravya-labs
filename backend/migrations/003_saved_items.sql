-- ============================================================
-- Saved Items Table & Security Policies
-- Run in the Supabase SQL editor (or psql) once.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.saved_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id     TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'unknown',
    name        TEXT NOT NULL,
    image_url   TEXT DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(user_id, item_id)
);

-- Index for faster retrieval by user
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON public.saved_items (user_id);

-- Enable Row Level Security
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Client Access
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
