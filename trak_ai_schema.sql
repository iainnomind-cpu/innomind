-- ============================================
-- TRAK AI - Schema for AI Assistant & Token Management
-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR
-- ============================================

-- 1. Token usage tracking per workspace per month
CREATE TABLE IF NOT EXISTS public.trak_ai_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,          -- First day of the month
  period_end DATE NOT NULL,            -- Last day of the month
  tokens_used BIGINT DEFAULT 0,        -- Total tokens consumed
  tokens_limit BIGINT DEFAULT 500000,  -- Monthly limit (Default 500k for OpenAI)
  request_count INT DEFAULT 0,         -- Number of API requests made
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, period_start)   -- One record per workspace per month
);

-- 2. Conversation history 
CREATE TABLE IF NOT EXISTS public.trak_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,                 -- 'projects', 'tasks', 'quotes', etc.
  context_id TEXT,                      -- Optional: project_id, task_id, etc.
  messages JSONB DEFAULT '[]'::jsonb,   -- Array of {role, content, timestamp}
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. AI feature config per workspace
CREATE TABLE IF NOT EXISTS public.trak_ai_config (
  workspace_id UUID PRIMARY KEY REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  ai_enabled BOOLEAN DEFAULT true,
  ai_provider TEXT DEFAULT 'openai',    -- Default OpenAI
  features_enabled JSONB DEFAULT '{
    "chat": true,
    "auto_tasks": true,
    "smart_quotes": true,
    "project_insights": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.trak_ai_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trak_ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trak_ai_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_token_usage_policy" ON public.trak_ai_token_usage;
CREATE POLICY "ai_token_usage_policy" ON public.trak_ai_token_usage FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "ai_conversations_policy" ON public.trak_ai_conversations;
CREATE POLICY "ai_conversations_policy" ON public.trak_ai_conversations FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "ai_config_policy" ON public.trak_ai_config;
CREATE POLICY "ai_config_policy" ON public.trak_ai_config FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- 4. Function to auto-reset tokens monthly
CREATE OR REPLACE FUNCTION public.get_or_create_ai_token_period(p_workspace_id UUID, p_limit BIGINT DEFAULT 500000)
RETURNS public.trak_ai_token_usage AS $$
DECLARE
  result public.trak_ai_token_usage;
  month_start DATE;
  month_end DATE;
BEGIN
  month_start := date_trunc('month', CURRENT_DATE)::DATE;
  month_end := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;

  SELECT * INTO result FROM public.trak_ai_token_usage
    WHERE workspace_id = p_workspace_id AND period_start = month_start;

  IF NOT FOUND THEN
    INSERT INTO public.trak_ai_token_usage (workspace_id, period_start, period_end, tokens_limit)
    VALUES (p_workspace_id, month_start, month_end, p_limit)
    RETURNING * INTO result;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to consume tokens 
CREATE OR REPLACE FUNCTION public.consume_ai_tokens(
  p_workspace_id UUID,
  p_tokens INT
)
RETURNS JSONB AS $$
DECLARE
  usage public.trak_ai_token_usage;
BEGIN
  usage := get_or_create_ai_token_period(p_workspace_id);

  UPDATE public.trak_ai_token_usage
  SET tokens_used = tokens_used + p_tokens,
      request_count = request_count + 1,
      updated_at = now()
  WHERE id = usage.id;

  RETURN jsonb_build_object(
    'allowed', true, -- Soft limit logic: Even if above limit, we return allowed: true, but the frontend can warn.
    'tokens_used', usage.tokens_used + p_tokens,
    'tokens_limit', usage.tokens_limit,
    'tokens_remaining', GREATEST(0, usage.tokens_limit - (usage.tokens_used + p_tokens))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
