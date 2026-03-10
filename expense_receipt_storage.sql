-- MIGRATION: Expense Receipt Storage
-- Execute this in your Supabase SQL Editor.

-- 1. Rename column in expenses table
-- We check if evidence_url exists before renaming to avoid errors if already renamed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'expenses' 
        AND column_name = 'evidence_url'
    ) THEN
        ALTER TABLE public.expenses RENAME COLUMN evidence_url TO receipt_url;
    END IF;
END $$;

-- Ensure receipt_url column exists if it didn't (safeguard)
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- 2. Create Storage Bucket for Receipts
-- We use a DO block to check if the bucket exists (Supabase storage.buckets table)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'expense-receipts') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('expense-receipts', 'expense-receipts', true);
    END IF;
END $$;

-- 3. Storage RLS Policies
-- Allow anyone to read receipts (public bucket)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'expense-receipts');

-- Allow authenticated users to upload receipts
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
CREATE POLICY "Authenticated Insert" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'expense-receipts' AND auth.role() = 'authenticated');

-- Allow users to delete their own uploads if we had owner tracking, 
-- otherwise let admins or same user delete. For now, authenticated can delete.
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'expense-receipts' AND auth.role() = 'authenticated');

-- Clean Up Schema Cache
NOTIFY pgrst, 'reload schema';
