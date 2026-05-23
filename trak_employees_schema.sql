-- ============================================
-- TRAK - Employees Schema Migration
-- ============================================

CREATE TABLE IF NOT EXISTS trak_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  payment_type TEXT DEFAULT 'hourly',
  salary_amount NUMERIC(12,2) DEFAULT 0,
  schedule_details TEXT,
  status TEXT DEFAULT 'active',
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_employees_workspace ON trak_employees(workspace_id);

ALTER TABLE trak_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trak_employees_policy" ON trak_employees FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);
