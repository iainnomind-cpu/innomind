-- Migración: Permitir miembros manuales en equipos de proyecto Trak
-- Ejecutar en Supabase Dashboard > SQL Editor

-- 1. Hacer employee_id opcional (nullable)
ALTER TABLE trak_project_members
  ALTER COLUMN employee_id DROP NOT NULL;

-- 2. Agregar campos para miembros manuales
ALTER TABLE trak_project_members
  ADD COLUMN IF NOT EXISTS guest_name  TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS is_guest    BOOLEAN DEFAULT FALSE;
