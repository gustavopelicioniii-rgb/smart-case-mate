-- =============================================
-- AUTO-SYNC: Processos → Financeiro
-- When a process is created or updated with value > 0,
-- automatically create/update a fee entry.
-- =============================================

CREATE OR REPLACE FUNCTION sync_processo_to_fee()
RETURNS TRIGGER AS $$
DECLARE
  v_description TEXT;
BEGIN
  -- Build description to avoid empty titles
  v_description := 'Honorário - ' || COALESCE(
    NULLIF(NEW.subject, ''), 
    NULLIF(NEW.class, ''), 
    'Processo ' || NEW.number
  );

  -- Only sync if value > 0
  IF NEW.value > 0 THEN
    -- Check if a fee already exists for this process
    -- Uses IS NOT DISTINCT FROM to handle NULL owner_id correctly
    IF EXISTS (
      SELECT 1 FROM fees 
      WHERE process_number = NEW.number 
      AND owner_id IS NOT DISTINCT FROM NEW.owner_id
    ) THEN
      -- Update existing fee
      UPDATE fees
      SET client = NEW.client,
          value = NEW.value,
          description = v_description,
          updated_at = NOW()
      WHERE process_number = NEW.number 
      AND owner_id IS NOT DISTINCT FROM NEW.owner_id;
    ELSE
      -- Create new fee
      INSERT INTO fees (client, process_number, description, value, status, due_date, owner_id)
      VALUES (
        NEW.client,
        NEW.number,
        v_description,
        NEW.value,
        'Pendente',
        NEW.next_deadline,
        NEW.owner_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on INSERT
DROP TRIGGER IF EXISTS sync_processo_fee_insert ON processos;
CREATE TRIGGER sync_processo_fee_insert
  AFTER INSERT ON processos
  FOR EACH ROW EXECUTE FUNCTION sync_processo_to_fee();

-- Trigger on UPDATE (when value, client, subject or number changes)
DROP TRIGGER IF EXISTS sync_processo_fee_update ON processos;
CREATE TRIGGER sync_processo_fee_update
  AFTER UPDATE OF value, client, subject, number ON processos
  FOR EACH ROW EXECUTE FUNCTION sync_processo_to_fee();
