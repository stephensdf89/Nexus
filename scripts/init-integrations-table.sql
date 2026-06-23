-- Create integrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR NOT NULL,
  platform VARCHAR NOT NULL,
  platform_id VARCHAR NOT NULL,
  page_name VARCHAR,
  access_token TEXT NOT NULL,
  page_access_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_email, platform, platform_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_integrations_user_platform ON integrations(user_email, platform);

-- Enable RLS if needed
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user-owned data
DROP POLICY IF EXISTS integrations_user_policy ON integrations;
CREATE POLICY integrations_user_policy ON integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.email = integrations.user_email
    )
  );
