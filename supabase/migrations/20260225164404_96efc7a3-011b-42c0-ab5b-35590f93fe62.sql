
-- 1. Create verification status enum
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- 2. Create app_role enum for admin
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. RLS for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 6. Create verification_requests table
CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  id_document_path text NOT NULL,
  selfie_path text NOT NULL,
  id_type text NOT NULL CHECK (id_type IN ('sa_id', 'passport', 'drivers_license')),
  status verification_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Add verification_status column to profiles
ALTER TABLE public.profiles ADD COLUMN verification_status verification_status NOT NULL DEFAULT 'unverified';

-- 8. RLS for verification_requests
CREATE POLICY "Users can view own requests" ON public.verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own requests" ON public.verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests" ON public.verification_requests
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests" ON public.verification_requests
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- 9. Create private storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);

-- 10. Storage RLS: users can upload to their own folder
CREATE POLICY "Users upload own verification docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own docs
CREATE POLICY "Users view own verification docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can view all verification docs
CREATE POLICY "Admins view all verification docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-docs'
    AND public.has_role(auth.uid(), 'admin')
  );
