-- MIGRATION: Recurring Expenses Table
-- This table tracks fixed monthly or weekly costs (rent, salaries, software, etc.) for cash flow projections.

CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    
    concept TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    category TEXT,
    
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
    day_of_period INTEGER NOT NULL, -- 1-31 for monthly, 1-7 for weekly
    
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE, -- Optional
    
    active BOOLEAN NOT NULL DEFAULT true,
    
    last_processed_date DATE, -- Internal tracking
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their workspace recurring expenses"
ON public.recurring_expenses FOR SELECT
USING (workspace_id = (get_current_workspace()::uuid));

CREATE POLICY "Users can insert recurring expenses in their workspace"
ON public.recurring_expenses FOR INSERT
WITH CHECK (workspace_id = (get_current_workspace()::uuid));

CREATE POLICY "Users can update their workspace recurring expenses"
ON public.recurring_expenses FOR UPDATE
USING (workspace_id = (get_current_workspace()::uuid));

CREATE POLICY "Users can delete their workspace recurring expenses"
ON public.recurring_expenses FOR DELETE
USING (workspace_id = (get_current_workspace()::uuid));

-- Trigger updated_at
CREATE TRIGGER update_recurring_expenses_updated_at
    BEFORE UPDATE ON public.recurring_expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
