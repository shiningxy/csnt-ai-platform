-- Make all new registered users admin by default
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
    'admin'  -- All new users become admin by default
  );
  RETURN NEW;
END;
$$;