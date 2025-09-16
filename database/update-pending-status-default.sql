-- Update the users table to set default status to 'pending'
-- and ensure all existing users without status get 'pending'

-- First, make sure the status column exists and has proper constraints
ALTER TABLE public.users 
ALTER COLUMN status SET DEFAULT 'pending';

-- Update any existing users that might not have a status
UPDATE public.users 
SET status = 'pending' 
WHERE status IS NULL;

-- Update the handle_new_user function to ensure new users start with pending status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user with data from auth.users
  INSERT INTO public.users (
    id, 
    name, 
    email,
    role, 
    status,
    email_verified,
    join_date,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1),
      'User'
    ),
    NEW.email,
    'user',
    'pending', -- Always start with pending status
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1),
      public.users.name
    ),
    email = COALESCE(NEW.email, public.users.email),
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, public.users.email_verified),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is in place
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to handle pending status correctly
-- Allow users to read their own data regardless of status
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Allow users to update their own non-sensitive fields (but not status)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent users from changing their own status or role
  status = (SELECT status FROM public.users WHERE id = auth.uid()) AND
  role = (SELECT role FROM public.users WHERE id = auth.uid())
);

-- Admin policy for viewing all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND status = 'approved'
  )
);

-- Admin policy for updating user status and roles
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" 
ON public.users FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND status = 'approved'
  )
);

-- Admin policy for inserting users (if needed)
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users" 
ON public.users FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND status = 'approved'
  )
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;