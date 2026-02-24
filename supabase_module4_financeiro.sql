-- =============================================
-- MODULE 4: FINANCEIRO (Fees / Financial)
-- =============================================

CREATE TABLE fees (
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

-- RLS
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fees" ON fees FOR SELECT USING (true);
CREATE POLICY "Auth users can insert fees" ON fees FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update fees" ON fees FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete fees" ON fees FOR DELETE USING (auth.uid() IS NOT NULL);

-- Auto-update
CREATE TRIGGER fees_updated_at
  BEFORE UPDATE ON fees
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
