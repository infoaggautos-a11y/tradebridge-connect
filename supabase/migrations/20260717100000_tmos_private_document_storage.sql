INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tmos-documents',
  'tmos-documents',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Admins can read TMOS document objects" ON storage.objects;
CREATE POLICY "Admins can read TMOS document objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tmos-documents'
    AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Users can read own TMOS document objects" ON storage.objects;
CREATE POLICY "Users can read own TMOS document objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tmos-documents'
    AND EXISTS (
      SELECT 1
      FROM public.event_registrations er
      WHERE er.user_id = auth.uid()
        AND name LIKE er.event_id || '/' || er.id || '/%'
    )
  );
