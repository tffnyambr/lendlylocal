
-- Add new columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS profile_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS data_sharing_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS deactivated boolean NOT NULL DEFAULT false;
