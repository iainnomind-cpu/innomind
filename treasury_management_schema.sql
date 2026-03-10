-- MIGRATION: Treasury Movements Table
-- Tracks every manual adjustment, transfer, deposit, and withdrawal for audit history.

CREATE TABLE IF NOT EXISTS public.treasury_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    
    account_id UUID NOT NULL REFERENCES public.finance_accounts(id) ON DELETE CASCADE,
    
    movement_type TEXT NOT NULL CHECK (movement_type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'adjustment')),
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT NOT NULL,
    reference_id UUID, -- Optional link to other records
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.treasury_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their workspace treasury movements"
ON public.treasury_movements FOR SELECT
USING (workspace_id = (get_current_workspace()::uuid));

CREATE POLICY "Users can insert treasury movements in their workspace"
ON public.treasury_movements FOR INSERT
WITH CHECK (workspace_id = (get_current_workspace()::uuid));

-- Trigger set_workspace
CREATE TRIGGER set_workspace_treasury_movements
    BEFORE INSERT ON public.treasury_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_workspace_on_insert();

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
