-- ========================================================
-- TRAK - HR Employee Documents Storage Bucket
-- Run this in your Supabase SQL Editor.
-- ========================================================

-- 1. Crear el bucket si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'employee-documents') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('employee-documents', 'employee-documents', true);
    END IF;
END $$;

-- 2. Políticas RLS de almacenamiento para employee-documents
DROP POLICY IF EXISTS "Public Access Employee Docs" ON storage.objects;
CREATE POLICY "Public Access Employee Docs" ON storage.objects FOR SELECT 
USING (bucket_id = 'employee-documents');

DROP POLICY IF EXISTS "Auth Insert Employee Docs" ON storage.objects;
CREATE POLICY "Auth Insert Employee Docs" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'employee-documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Employee Docs" ON storage.objects;
CREATE POLICY "Auth Delete Employee Docs" ON storage.objects FOR DELETE 
USING (bucket_id = 'employee-documents' AND auth.role() = 'authenticated');

-- Recargar caché de esquema de PostgREST
NOTIFY pgrst, 'reload schema';
