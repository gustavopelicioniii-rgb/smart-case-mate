-- Despesas do escritório (luz, água, assinaturas, etc.) — editáveis.
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.office_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  category TEXT NOT NULL CHECK (category IN ('luz', 'agua', 'assinaturas', 'outros')),
  description TEXT NOT NULL DEFAULT '',
  value NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pago', 'Pendente', 'Atrasado', 'Cancelado')),
  due_date DATE,
  paid_date DATE,

  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_office_expenses_owner ON public.office_expenses(owner_id);
CREATE INDEX IF NOT EXISTS idx_office_expenses_category ON public.office_expenses(category);
CREATE INDEX IF NOT EXISTS idx_office_expenses_due_date ON public.office_expenses(due_date);

ALTER TABLE public.office_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view office_expenses" ON public.office_expenses FOR SELECT USING (true);
CREATE POLICY "Auth users can insert office_expenses" ON public.office_expenses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update office_expenses" ON public.office_expenses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete office_expenses" ON public.office_expenses FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER office_expenses_updated_at
  BEFORE UPDATE ON public.office_expenses
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

COMMENT ON TABLE public.office_expenses IS 'Despesas do escritório: luz, água, assinaturas, outros. Tudo editável.';
