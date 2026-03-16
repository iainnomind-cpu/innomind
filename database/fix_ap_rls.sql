-- Resetting and Fixing RLS Policies for Accounts Payable
-- This ensures that no broken or missing policy is hiding the rows from the frontend.

-- 1. Drop existing potentially corrupted policies on accounts_payable
DROP POLICY IF EXISTS "RLS on accounts_payable" ON public.accounts_payable;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.accounts_payable;
DROP POLICY IF EXISTS "Users can view their workspace accounts_payable" ON public.accounts_payable;

-- 2. Ensure RLS is enabled
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

-- 3. Create a clean, bulletproof policy using BOTH workspace_id and workspace
CREATE POLICY "RLS on accounts_payable_read" 
ON public.accounts_payable 
FOR SELECT 
USING (
    workspace_id = get_current_workspace()::uuid 
    OR workspace = get_current_workspace()::uuid
);

CREATE POLICY "RLS on accounts_payable_all" 
ON public.accounts_payable 
FOR ALL 
USING (
    workspace_id = get_current_workspace()::uuid 
);

-- 4. Reload Schema Cache just in case
NOTIFY pgrst, 'reload schema';
