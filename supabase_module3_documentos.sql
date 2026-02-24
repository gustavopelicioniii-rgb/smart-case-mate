-- =============================================
-- MODULE 3: DOCUMENTOS (Documents + Storage)
-- =============================================

-- Documents metadata table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  name TEXT NOT NULL,                      -- Original file name
  file_path TEXT NOT NULL,                 -- Path in Supabase Storage
  file_size BIGINT NOT NULL DEFAULT 0,     -- Size in bytes
  mime_type TEXT NOT NULL DEFAULT '',       -- e.g. application/pdf
  
  process_number TEXT NOT NULL DEFAULT '', -- Linked process number (optional)
  description TEXT NOT NULL DEFAULT '',    -- Optional description
  
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Auth users can insert documents" ON documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update documents" ON documents FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete documents" ON documents FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create Storage bucket (run this in SQL Editor)
-- NOTE: You also need to create the bucket via Supabase Dashboard:
--   1. Go to Storage in the left sidebar
--   2. Click "New bucket"
--   3. Name it "documents" 
--   4. Set it as PUBLIC (so files can be downloaded)
--   5. Click "Create bucket"
--
-- Then create a storage policy:
--   1. Click on the "documents" bucket
--   2. Go to "Policies" tab
--   3. Create a new policy for ALL operations
--   4. Allow access to authenticated users

-- Alternative: Create bucket via SQL (may or may not work depending on permissions)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Auth users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Auth users can delete documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
