-- =============================================
-- WHATSAPP INTEGRATION: Messages + Auto CRM Lead
-- =============================================

-- WhatsApp configuration table
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('cloud_api', 'z_api', 'evolution_api')),
  api_url TEXT DEFAULT '',
  api_key TEXT DEFAULT '',
  instance_id TEXT DEFAULT '',
  phone_number TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id)
);

ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own whatsapp config" ON whatsapp_config
  FOR ALL USING (owner_id = auth.uid());

-- WhatsApp messages table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_phone TEXT NOT NULL,
  message_text TEXT NOT NULL DEFAULT '',
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')) DEFAULT 'incoming',
  media_url TEXT DEFAULT '',
  message_id_external TEXT DEFAULT '',
  status TEXT DEFAULT 'received',
  crm_client_id UUID REFERENCES crm_clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own whatsapp messages" ON whatsapp_messages
  FOR ALL USING (owner_id = auth.uid());

-- Index for fast lookups by phone
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(contact_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);

-- AUTO-CREATE CRM LEAD from incoming WhatsApp message
CREATE OR REPLACE FUNCTION auto_create_crm_lead_from_whatsapp()
RETURNS TRIGGER AS $$
DECLARE
  existing_client_id UUID;
BEGIN
  -- Only for incoming messages
  IF NEW.direction = 'incoming' THEN
    -- Check if a CRM client already exists with this phone
    SELECT id INTO existing_client_id
    FROM crm_clients
    WHERE phone = NEW.contact_phone AND owner_id = NEW.owner_id
    LIMIT 1;

    IF existing_client_id IS NOT NULL THEN
      -- Link message to existing client
      NEW.crm_client_id := existing_client_id;
      
      -- Move client to 'Contato Inicial' if they were in 'Lead'
      UPDATE crm_clients
      SET status = CASE WHEN status = 'Lead' THEN 'Contato Inicial' ELSE status END,
          updated_at = NOW()
      WHERE id = existing_client_id;
    ELSE
      -- Create new CRM lead
      INSERT INTO crm_clients (name, phone, email, status, source, notes, owner_id)
      VALUES (
        COALESCE(NULLIF(NEW.contact_name, ''), 'WhatsApp ' || NEW.contact_phone),
        NEW.contact_phone,
        '',
        'Lead',
        'WhatsApp',
        'Contato automático via WhatsApp: ' || LEFT(NEW.message_text, 200),
        NEW.owner_id
      )
      RETURNING id INTO existing_client_id;
      
      NEW.crm_client_id := existing_client_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS whatsapp_auto_crm_lead ON whatsapp_messages;
CREATE TRIGGER whatsapp_auto_crm_lead
  BEFORE INSERT ON whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION auto_create_crm_lead_from_whatsapp();
