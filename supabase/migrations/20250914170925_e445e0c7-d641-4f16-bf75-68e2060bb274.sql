-- 🚨 CRITICAL SECURITY FIX: Secure API Keys Table
-- Drop the extremely dangerous policy that allows public access to all API keys
DROP POLICY IF EXISTS "Allow all operations on api_keys" ON public.api_keys;

-- Create a security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create secure RLS policies for API keys - ONLY ADMINS can manage API keys
CREATE POLICY "Only admins can view API keys" 
ON public.api_keys 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Only admins can create API keys" 
ON public.api_keys 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Only admins can update API keys" 
ON public.api_keys 
FOR UPDATE 
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Only admins can delete API keys" 
ON public.api_keys 
FOR DELETE 
USING (public.is_current_user_admin());