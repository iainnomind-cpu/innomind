-- MIGRATION: Storage Buckets for Finance
-- Execute this in your Supabase SQL Editor.

-- 1. Create Buckets
DO $$
BEGIN
    -- Expense Receipts
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'expense-receipts') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('expense-receipts', 'expense-receipts', true);
    END IF;

    -- Payment Evidence
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'payment-evidence') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('payment-evidence', 'payment-evidence', true);
    END IF;
END $$;

-- 2. RLS Policies for expense-receipts
DROP POLICY IF EXISTS "Public Access Expenses" ON storage.objects;
CREATE POLICY "Public Access Expenses" ON storage.objects FOR SELECT 
USING (bucket_id = 'expense-receipts');

DROP POLICY IF EXISTS "Auth Insert Expenses" ON storage.objects;
CREATE POLICY "Auth Insert Expenses" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'expense-receipts' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Expenses" ON storage.objects;
CREATE POLICY "Auth Delete Expenses" ON storage.objects FOR DELETE 
USING (bucket_id = 'expense-receipts' AND auth.role() = 'authenticated');

-- 3. RLS Policies for payment-evidence
DROP POLICY IF EXISTS "Public Access Payments" ON storage.objects;
CREATE POLICY "Public Access Payments" ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-evidence');

DROP POLICY IF EXISTS "Auth Insert Payments" ON storage.objects;
CREATE POLICY "Auth Insert Payments" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payment-evidence' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Payments" ON storage.objects;
CREATE POLICY "Auth Delete Payments" ON storage.objects FOR DELETE 
USING (bucket_id = 'payment-evidence' AND auth.role() = 'authenticated');

-- Clean Up Schema Cache
NOTIFY pgrst, 'reload schema';
