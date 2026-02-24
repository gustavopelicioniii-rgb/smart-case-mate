-- =============================================
-- USER PERMISSIONS: Granular module-level access
-- =============================================

-- Add 'role' options: admin, lawyer, assistant
-- (admin already exists, adding assistant)

-- Permissions table: which modules each user can access
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module)
);

ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage permissions
CREATE POLICY "Admins can manage permissions" ON user_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can read their own permissions
CREATE POLICY "Users can read own permissions" ON user_permissions
  FOR SELECT USING (user_id = auth.uid());

-- Update profiles role check to include 'assistant'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'lawyer', 'assistant'));

-- Function to create default permissions for a new user
CREATE OR REPLACE FUNCTION create_default_permissions()
RETURNS TRIGGER AS $$
DECLARE
  modules TEXT[] := ARRAY['processos','agenda','pecas','crm','financeiro','documentos','publicacoes','relatorios','configuracoes'];
  m TEXT;
BEGIN
  FOREACH m IN ARRAY modules LOOP
    INSERT INTO user_permissions (user_id, module, can_view, can_edit)
    VALUES (
      NEW.id,
      m,
      CASE WHEN NEW.role = 'admin' THEN true ELSE true END,
      CASE WHEN NEW.role = 'admin' THEN true ELSE false END
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create permissions on new profile
DROP TRIGGER IF EXISTS on_profile_created_permissions ON profiles;
CREATE TRIGGER on_profile_created_permissions
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_permissions();
