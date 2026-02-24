-- =============================================
-- SMART CASE MATE - Módulos 2, 3, 4, 5, 6
-- (Módulo 1 já foi rodado anteriormente)
-- =============================================

-- =============================================
-- MODULE 2: CRM KANBAN
-- =============================================

CREATE TABLE IF NOT EXISTS crm_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-info/10 text-info',
  position INTEGER NOT NULL DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS crm_clients (
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

ALTER TABLE crm_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view stages' AND tablename = 'crm_stages') THEN
    CREATE POLICY "Anyone can view stages" ON crm_stages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can insert stages' AND tablename = 'crm_stages') THEN
    CREATE POLICY "Auth users can insert stages" ON crm_stages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can update stages' AND tablename = 'crm_stages') THEN
    CREATE POLICY "Auth users can update stages" ON crm_stages FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can delete stages' AND tablename = 'crm_stages') THEN
    CREATE POLICY "Auth users can delete stages" ON crm_stages FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view clients' AND tablename = 'crm_clients') THEN
    CREATE POLICY "Anyone can view clients" ON crm_clients FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can insert clients' AND tablename = 'crm_clients') THEN
    CREATE POLICY "Auth users can insert clients" ON crm_clients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can update clients' AND tablename = 'crm_clients') THEN
    CREATE POLICY "Auth users can update clients" ON crm_clients FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can delete clients' AND tablename = 'crm_clients') THEN
    CREATE POLICY "Auth users can delete clients" ON crm_clients FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DROP TRIGGER IF EXISTS crm_clients_updated_at ON crm_clients;
CREATE TRIGGER crm_clients_updated_at BEFORE UPDATE ON crm_clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

INSERT INTO crm_stages (name, color, position) VALUES
  ('Lead', 'bg-info/10 text-info', 0),
  ('Consulta', 'bg-warning/10 text-warning', 1),
  ('Contrato', 'bg-accent/10 text-accent', 2),
  ('Processo', 'bg-success/10 text-success', 3);

-- =============================================
-- MODULE 3: DOCUMENTOS
-- =============================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT '',
  process_number TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view documents' AND tablename = 'documents') THEN
    CREATE POLICY "Anyone can view documents" ON documents FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can insert documents' AND tablename = 'documents') THEN
    CREATE POLICY "Auth users can insert documents" ON documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can update documents' AND tablename = 'documents') THEN
    CREATE POLICY "Auth users can update documents" ON documents FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can delete documents' AND tablename = 'documents') THEN
    CREATE POLICY "Auth users can delete documents" ON documents FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can upload docs' AND tablename = 'objects') THEN
    CREATE POLICY "Auth users can upload docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view docs' AND tablename = 'objects') THEN
    CREATE POLICY "Anyone can view docs" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can delete docs' AND tablename = 'objects') THEN
    CREATE POLICY "Auth users can delete docs" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
  END IF;
END $$;

-- =============================================
-- MODULE 4: FINANCEIRO
-- =============================================

CREATE TABLE IF NOT EXISTS fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  client TEXT NOT NULL,
  process_number TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  value NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pago', 'Pendente', 'Atrasado', 'Cancelado')),
  due_date DATE,
  paid_date DATE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE fees ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view fees' AND tablename = 'fees') THEN
    CREATE POLICY "Anyone can view fees" ON fees FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can insert fees' AND tablename = 'fees') THEN
    CREATE POLICY "Auth users can insert fees" ON fees FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can update fees' AND tablename = 'fees') THEN
    CREATE POLICY "Auth users can update fees" ON fees FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can delete fees' AND tablename = 'fees') THEN
    CREATE POLICY "Auth users can delete fees" ON fees FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DROP TRIGGER IF EXISTS fees_updated_at ON fees;
CREATE TRIGGER fees_updated_at BEFORE UPDATE ON fees FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- =============================================
-- MODULE 6: PEÇAS (Generated legal documents)
-- =============================================

CREATE TABLE IF NOT EXISTS pecas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT '',
  generated_text TEXT NOT NULL DEFAULT '',
  process_number TEXT NOT NULL DEFAULT '',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE pecas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view pecas' AND tablename = 'pecas') THEN
    CREATE POLICY "Anyone can view pecas" ON pecas FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can insert pecas' AND tablename = 'pecas') THEN
    CREATE POLICY "Auth users can insert pecas" ON pecas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can update pecas' AND tablename = 'pecas') THEN
    CREATE POLICY "Auth users can update pecas" ON pecas FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can delete pecas' AND tablename = 'pecas') THEN
    CREATE POLICY "Auth users can delete pecas" ON pecas FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;
