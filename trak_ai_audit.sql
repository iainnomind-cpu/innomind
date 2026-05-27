-- ============================================
-- TRAK AI - Audit Logs Schema for AI Assistant & Tools
-- ============================================

CREATE TABLE IF NOT EXISTS public.trak_ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  arguments JSONB DEFAULT '{}'::jsonb,
  response JSONB DEFAULT '{}'::jsonb,
  tokens_used INT DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.trak_ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
DROP POLICY IF EXISTS "ai_audit_logs_policy" ON public.trak_ai_audit_logs;
CREATE POLICY "ai_audit_logs_policy" ON public.trak_ai_audit_logs FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));
