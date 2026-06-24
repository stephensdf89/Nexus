-- Create profiles table in Supabase and refresh PostgREST schema cache
-- Run this in Supabase SQL Editor for the target project.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
	id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
	name TEXT,
	username TEXT UNIQUE,
	bio TEXT,
	twitter TEXT,
	instagram TEXT,
	avatar_url TEXT,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique
	ON public.profiles(username)
	WHERE username IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
	BEFORE UPDATE ON public.profiles
	FOR EACH ROW
	EXECUTE FUNCTION public.set_profiles_updated_at();

-- Ensure Data API role access (RLS still controls row access)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own profile" ON public.profiles;
CREATE POLICY "Users can access their own profile"
ON public.profiles
FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Force PostgREST (Supabase Data API) to reload schema cache now.
NOTIFY pgrst, 'reload schema';


