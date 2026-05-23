-- ============================================
-- TRAK - Project Members Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS trak_project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES trak_projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES trak_employees(id) ON DELETE CASCADE,
  role_in_project TEXT,
  hourly_rate_override NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_trak_project_members_project ON trak_project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_trak_project_members_employee ON trak_project_members(employee_id);

ALTER TABLE trak_project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trak_project_members_policy" ON trak_project_members FOR ALL USING (
  project_id IN (SELECT id FROM trak_projects WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))
);
