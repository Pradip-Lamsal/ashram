-- Fix user roles: Change billing_staff to user
UPDATE users SET role = 'user' WHERE role = 'billing_staff';

-- Ensure all new registrations default to 'user' role
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
