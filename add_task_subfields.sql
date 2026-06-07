-- Migración: Agregar campos sub_activities y pending_items a trak_tasks
-- Ejecutar en Supabase Dashboard > SQL Editor

ALTER TABLE trak_tasks 
  ADD COLUMN IF NOT EXISTS sub_activities TEXT,
  ADD COLUMN IF NOT EXISTS pending_items TEXT;
