-- =========================================================================
-- MIGRACIÓN DE BD: Separación Obligatoria de Datos por Plataforma y Workspace
-- ARCHIVO: fix_trak_ai_vector_search.sql
-- =========================================================================
-- Ejecuta este script en el editor SQL de Supabase para asegurar que:
-- 1. Existe una tabla de embeddings/documentos para la IA.
-- 2. La función de búsqueda vectorial (RPC) filtra de forma estricta por 'workspace_id' y 'platform'.
-- =========================================================================

-- Habilitar extensión pgvector si no existe
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Tabla de Documentos y Embeddings de IA (si no existe)
CREATE TABLE IF NOT EXISTS public.trak_ai_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('track', 'crm_erp')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(1536), -- Vector de 1536 dimensiones (estándar de OpenAI)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en la tabla de embeddings
ALTER TABLE public.trak_ai_embeddings ENABLE ROW LEVEL SECURITY;

-- Crear política estricta de seguridad RLS basada en membresía de workspace
DROP POLICY IF EXISTS "trak_ai_embeddings_tenant_policy" ON public.trak_ai_embeddings;
CREATE POLICY "trak_ai_embeddings_tenant_policy" ON public.trak_ai_embeddings FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- 2. Función RPC para Búsqueda Vectorial (RAG) con Aislamiento Total
-- Esta función recibe platform y p_workspace_id de forma obligatoria.
CREATE OR REPLACE FUNCTION public.match_trak_ai_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_workspace_id UUID,
  p_platform TEXT
)
RETURNS TABLE (
  id UUID,
  workspace_id UUID,
  platform TEXT,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Validar parámetro platform obligatorio
  IF p_platform IS NULL OR (p_platform <> 'track' AND p_platform <> 'crm_erp') THEN
    RAISE EXCEPTION 'Cabecera o parámetro platform inválido o faltante. Debe ser track o crm_erp.';
  END IF;

  -- Validar parámetro workspace_id obligatorio
  IF p_workspace_id IS NULL THEN
    RAISE EXCEPTION 'El workspace_id es obligatorio para realizar consultas.';
  END IF;

  RETURN QUERY
  SELECT
    d.id,
    d.workspace_id,
    d.platform,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.trak_ai_embeddings d
  WHERE d.workspace_id = p_workspace_id
    AND d.platform = p_platform
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Comentario informativo para la base de datos
COMMENT ON FUNCTION public.match_trak_ai_documents IS 'Búsqueda de embeddings de IA con aislamiento estricto por platform y workspace_id';
