/*
  # Admin Dashboard Tables

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `key` (text, unique, not null) - The actual API key
      - `name` (text, not null) - Friendly name for the key
      - `user_id` (uuid, reference to auth.users)
      - `last_used_at` (timestamptz) - Track last usage
      - `expires_at` (timestamptz) - Optional expiration
      - `is_active` (boolean, default true)
      - `permissions` (jsonb) - Store permissions as JSON
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `activity_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, reference to auth.users)
      - `api_key_id` (uuid, reference to api_keys) - Optional
      - `action` (text, not null) - Action performed
      - `resource_type` (text) - Type of resource (place, category, etc.)
      - `resource_id` (uuid) - ID of affected resource
      - `ip_address` (text) - Client IP
      - `user_agent` (text) - Client user agent
      - `metadata` (jsonb) - Additional data
      - `created_at` (timestamptz)

    - `system_settings`
      - `key` (text, primary key) - Setting key
      - `value` (jsonb, not null) - Setting value
      - `description` (text) - Setting description
      - `updated_at` (timestamptz)
      - `updated_by` (uuid, reference to auth.users)

  2. Security
    - Enable RLS on all tables
    - Only authenticated users can access api_keys
    - Only authenticated users can view activity_logs
    - Only authenticated users can manage system_settings
    - Users can only manage their own API keys

  3. Indexes
    - Index on api_keys.user_id for filtering
    - Index on api_keys.key for lookups
    - Index on activity_logs.user_id for filtering
    - Index on activity_logs.created_at for sorting
    - Index on activity_logs.resource_type for filtering

  4. Important Notes
    - API keys use UUID format for security
    - Activity logs track all admin actions
    - System settings stored as JSONB for flexibility
    - Timestamps track all changes
*/

-- Create function to automatically update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  permissions jsonb DEFAULT '{"read": true, "write": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_api_key_id ON activity_logs(api_key_id);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- API Keys policies
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Authenticated users can view activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System settings policies
CREATE POLICY "Authenticated users can view system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage system settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete system settings"
  ON system_settings FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for api_keys updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_api_keys_updated_at'
  ) THEN
    CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_system_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default system settings
INSERT INTO system_settings (key, value, description)
VALUES
  ('site_name', '"CityPlace Admin"'::jsonb, 'Name of the application'),
  ('maintenance_mode', 'false'::jsonb, 'Enable/disable maintenance mode'),
  ('max_upload_size', '10485760'::jsonb, 'Maximum file upload size in bytes (10MB)'),
  ('items_per_page', '20'::jsonb, 'Default items per page for pagination')
ON CONFLICT (key) DO NOTHING;