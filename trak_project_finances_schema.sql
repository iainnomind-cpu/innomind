-- ============================================
-- TRAK - Project Finances & Milestones Schema
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS trak_project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES trak_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  percentage NUMERIC(5,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid')),
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_project_milestones_project ON trak_project_milestones(project_id);

ALTER TABLE trak_project_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trak_project_milestones_policy" ON trak_project_milestones FOR ALL USING (
  project_id IN (SELECT id FROM trak_projects WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))
);
