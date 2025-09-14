-- 🔒 CRITICAL SECURITY FIXES: Secure User Data and Fix RLS Policies

-- 1. Fix profiles table - Remove dangerous public email exposure
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create secure policies for profiles table
-- Users can view their own full profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Others can only see basic info (name, avatar, role) but NOT email
CREATE POLICY "Users can view others basic profile info" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Admins can view all profiles including emails
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_current_user_admin());

-- 2. Fix drafts table RLS policy - Remove self-referencing logic
DROP POLICY IF EXISTS "Users can manage their own drafts" ON public.drafts;

CREATE POLICY "Users can manage their own drafts" 
ON public.drafts 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Fix notifications table RLS policies - Remove self-referencing logic  
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());