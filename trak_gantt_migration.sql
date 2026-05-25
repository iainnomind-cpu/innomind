-- ============================================
-- TRAK - Tasks Start Date for Gantt
-- Run this in Supabase SQL Editor
-- ============================================

-- Add start_date to trak_tasks if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'trak_tasks' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE trak_tasks ADD COLUMN start_date DATE;
  END IF;
END $$;
