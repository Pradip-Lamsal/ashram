-- Add status column to users table for admin approval workflow
-- Run this in your Supabase SQL Editor

-- Step 1: Add status column with default value 'pending'
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Step 2: Update existing users to 'approved' status (so they can continue using the system)
UPDATE public.users 
SET status = 'approved' 
WHERE status IS NULL OR status = 'pending';

-- Step 3: Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Step 4: Update the handle_new_user function to set default status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    status,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    'user',
    'pending', -- New users start with pending status
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', users.full_name),
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: RLS policies (skipped for now)
-- Note: RLS policies can be added later if needed

-- Step 6: Grant necessary permissions
GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Step 7: Create function to update user status (for admin use)
CREATE OR REPLACE FUNCTION update_user_status(user_id UUID, new_status TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS(
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update user status';
  END IF;
  
  -- Validate status
  IF new_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be pending, approved, or rejected';
  END IF;
  
  -- Update user status
  UPDATE public.users 
  SET status = new_status, updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_status(UUID, TEXT) TO authenticated;

-- Verification queries (optional - run to check the changes)
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'status';

-- SELECT status, COUNT(*) as count 
-- FROM public.users 
-- GROUP BY status;
