-- Forma de pagamento em honorários (desvinculado do valor da causa).
-- Valor da causa fica apenas em processos; valor do honorário e forma de pagamento em fees.

ALTER TABLE public.fees
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'a_vista'
  CHECK (payment_method IN ('a_vista', 'entrada_parcelas', 'cartao_credito'));

ALTER TABLE public.fees
  ADD COLUMN IF NOT EXISTS entrada_value NUMERIC(15,2);

ALTER TABLE public.fees
  ADD COLUMN IF NOT EXISTS installments INTEGER;

COMMENT ON COLUMN public.fees.payment_method IS 'Forma de pagamento: a_vista, entrada_parcelas, cartao_credito';
COMMENT ON COLUMN public.fees.entrada_value IS 'Valor da entrada (R$) quando payment_method = entrada_parcelas';
COMMENT ON COLUMN public.fees.installments IS 'Número de parcelas (entrada+parcelas ou cartão de crédito)';
