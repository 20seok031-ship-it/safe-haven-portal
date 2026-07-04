
CREATE TABLE public.reference_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reference_materials TO authenticated;
GRANT SELECT ON public.reference_materials TO anon;
GRANT ALL ON public.reference_materials TO service_role;

ALTER TABLE public.reference_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reference materials"
  ON public.reference_materials FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert reference materials"
  ON public.reference_materials FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Uploader can update own"
  ON public.reference_materials FOR UPDATE TO authenticated USING (auth.uid() = uploaded_by);
CREATE POLICY "Uploader can delete own"
  ON public.reference_materials FOR DELETE TO authenticated USING (auth.uid() = uploaded_by);

CREATE POLICY "Public read reference bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reference-materials');
CREATE POLICY "Authenticated upload reference bucket"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reference-materials');
CREATE POLICY "Authenticated update reference bucket"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'reference-materials');
CREATE POLICY "Authenticated delete reference bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'reference-materials');

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'i0215130@app.local') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
      'i0215130@app.local', crypt('123456789', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"i0215130"}'::jsonb,
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_user_id,
      json_build_object('sub', new_user_id::text, 'email', 'i0215130@app.local')::jsonb,
      'email', new_user_id::text, now(), now(), now());
  END IF;
END $$;
