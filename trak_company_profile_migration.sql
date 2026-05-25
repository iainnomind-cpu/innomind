-- Add company_name and company_logo_url to trak_workspace_settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trak_workspace_settings' AND column_name = 'company_name') THEN
    ALTER TABLE trak_workspace_settings ADD COLUMN company_name TEXT;
    ALTER TABLE trak_workspace_settings ADD COLUMN company_logo_url TEXT;
  END IF;
END $$;
