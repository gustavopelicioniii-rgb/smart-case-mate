-- =============================================
-- MODULE 2: CRM KANBAN
-- =============================================

-- Stages (columns) of the Kanban board
CREATE TABLE crm_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-info/10 text-info',
  position INTEGER NOT NULL DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Clients (cards) in the Kanban board
CREATE TABLE crm_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',

  stage_id UUID REFERENCES crm_stages(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,

  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS for stages
ALTER TABLE crm_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stages" ON crm_stages FOR SELECT USING (true);
CREATE POLICY "Auth users can insert stages" ON crm_stages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update stages" ON crm_stages FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete stages" ON crm_stages FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for clients
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clients" ON crm_clients FOR SELECT USING (true);
CREATE POLICY "Auth users can insert clients" ON crm_clients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update clients" ON crm_clients FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete clients" ON crm_clients FOR DELETE USING (auth.uid() IS NOT NULL);

-- Auto-update updated_at for crm_clients
CREATE TRIGGER crm_clients_updated_at
  BEFORE UPDATE ON crm_clients
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Insert default stages
INSERT INTO crm_stages (name, color, position) VALUES
  ('Lead', 'bg-info/10 text-info', 0),
  ('Consulta', 'bg-warning/10 text-warning', 1),
  ('Contrato', 'bg-accent/10 text-accent', 2),
  ('Processo', 'bg-success/10 text-success', 3);
