-- Security and roles improvements: enable admin creation and safe role changes

-- 1) Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2) Make the first registered user an admin automatically and keep email-based defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, avatar, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') = 0 THEN 'admin'  -- first user becomes admin
      WHEN NEW.email = 'admin@test.com' THEN 'admin'
      WHEN NEW.email = 'lead@test.com' THEN 'team_lead'
      ELSE 'algorithm_engineer'
    END
  );
  RETURN NEW;
END;
$$;

-- 3) Ensure the trigger exists on auth.users to create profiles automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4) RLS policies for profiles
-- Cleanup conflicting/overly-permissive policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view others basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: users can select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: admins can select all" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: users can insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: users can update own (no role change)" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: admins can update all" ON public.profiles;

-- Recreate secure minimal policies
CREATE POLICY "Profiles: users can select own"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Profiles: admins can select all"
ON public.profiles
FOR SELECT
USING (public.is_current_user_admin());

CREATE POLICY "Profiles: users can insert own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profiles: users can update own (no role change)"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profiles: admins can update all"
ON public.profiles
FOR UPDATE
USING (public.is_current_user_admin())
WITH CHECK (true);

-- 5) Prevent non-admins from changing role via trigger
CREATE OR REPLACE FUNCTION public.prevent_non_admin_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF NOT public.is_current_user_admin() THEN
        RAISE EXCEPTION 'Only admins can change roles';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_role_guard ON public.profiles;
CREATE TRIGGER profiles_role_guard
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.prevent_non_admin_role_change();
