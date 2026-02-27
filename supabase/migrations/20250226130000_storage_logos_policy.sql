-- Políticas de Storage para o bucket "documents", pasta logos/{user_id}/
-- Permite que usuários autenticados façam upload da logo do escritório em logos/{auth.uid()}/
-- e leiam/atualizem/removam apenas os próprios arquivos.

-- Upload: apenas na pasta logos/<próprio user id>/
CREATE POLICY "Users can upload own logo in documents/logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);

-- Leitura: apenas arquivos na própria pasta logos/<user id>/
CREATE POLICY "Users can read own logos in documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);

-- Atualização (ex.: upsert ao trocar logo): mesma pasta
CREATE POLICY "Users can update own logo in documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);

-- Remoção: mesma pasta (ao remover logo nas Configurações)
CREATE POLICY "Users can delete own logo in documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);
