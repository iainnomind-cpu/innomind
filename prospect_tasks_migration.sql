-- ============================================================
-- MIGRACIÓN: Agregar columna 'tareas' a tabla prospects
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Agregar columna tareas como JSONB (array de objetos)
ALTER TABLE public.prospects
ADD COLUMN IF NOT EXISTS tareas JSONB DEFAULT '[]'::jsonb;

-- 2. Verificar que la columna fue agregada correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'prospects'
  AND column_name = 'tareas';
