-- ============================================
-- TRAK - Project Files Schema
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS trak_project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES trak_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_project_files_project ON trak_project_files(project_id);

ALTER TABLE trak_project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trak_project_files_policy" ON trak_project_files FOR ALL USING (
  project_id IN (SELECT id FROM trak_projects WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))
);
