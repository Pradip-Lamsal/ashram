"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Database,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SetupPage() {
  const [setupStatus, setSetupStatus] = useState<
    "checking" | "required" | "complete"
  >("checking");
  const [copied, setCopied] = useState(false);

  const setupSQL = `-- STEP 1: Create users table with fixed RLS policies
-- Copy and paste this SQL into your Supabase SQL Editor and run it

-- Create users table for storing user profiles
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    permissions TEXT[] DEFAULT '{}',
    join_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- FIXED RLS Policies (no infinite recursion)

-- 1. Users can view their own profile (uses auth.uid() - no recursion)
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Allow INSERT for authenticated users (for registration)
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 4. Admin access policy (email-based to avoid recursion)
-- Change these emails to match your admin users
CREATE POLICY "admin_full_access" ON public.users
    FOR ALL 
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            'admin@ashram.com',
            'pradip@ashram.com'
        ) OR 
        auth.jwt() ->> 'email' LIKE '%@admin.ashram.com'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' IN (
            'admin@ashram.com', 
            'pradip@ashram.com'
        ) OR 
        auth.jwt() ->> 'email' LIKE '%@admin.ashram.com'
    );

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Verify policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'users';

-- Success message
SELECT 'Users table created successfully with fixed RLS policies! Registration and login should now work.' as result;`;

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/database/status");
      const data = await response.json();

      if (data.setup_required) {
        setSetupStatus("required");
      } else {
        setSetupStatus("complete");
      }
    } catch {
      setSetupStatus("required");
    }
  };

  const copySQL = async () => {
    try {
      await navigator.clipboard.writeText(setupSQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Database className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Database Setup & RLS Policy Fix
          </h1>
          <p className="text-lg text-gray-600">
            Fix RLS policies to resolve authentication infinite recursion errors
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              {setupStatus === "checking" && (
                <>
                  <div className="w-5 h-5 mr-2 border-b-2 border-orange-500 rounded-full animate-spin" />
                  Checking Database Status...
                </>
              )}
              {setupStatus === "required" && (
                <>
                  <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                  Database Setup Required
                </>
              )}
              {setupStatus === "complete" && (
                <>
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Database Setup Complete
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {setupStatus === "required" && (
              <div className="p-4 border border-red-200 rounded-md bg-red-50">
                <p className="text-red-700">
                  The users table has RLS policies causing infinite recursion
                  during login. Please follow the setup instructions below to
                  fix the policies.
                </p>
              </div>
            )}
            {setupStatus === "complete" && (
              <div className="p-4 border border-green-200 rounded-md bg-green-50">
                <p className="text-green-700">
                  ✅ Database is properly configured with fixed RLS policies!
                  Authentication should now work without infinite recursion.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => (window.location.href = "/register")}
                >
                  Go to Registration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {setupStatus === "required" && (
          <>
            {/* Instructions Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Setup Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 text-sm font-bold text-orange-700 bg-orange-100 rounded-full">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Open Supabase Dashboard
                    </h3>
                    <p className="text-gray-600">
                      Go to your Supabase project dashboard and navigate to the
                      SQL Editor
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        window.open("https://supabase.com/dashboard", "_blank")
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Supabase Dashboard
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 text-sm font-bold text-orange-700 bg-orange-100 rounded-full">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Copy the SQL Script
                    </h3>
                    <p className="text-gray-600">
                      Copy the SQL script below and paste it into the SQL Editor
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 text-sm font-bold text-orange-700 bg-orange-100 rounded-full">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Run the Script
                    </h3>
                    <p className="text-gray-600">
                      Click &ldquo;Run&rdquo; to execute the SQL and create the
                      users table
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 text-sm font-bold text-orange-700 bg-orange-100 rounded-full">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Refresh This Page
                    </h3>
                    <p className="text-gray-600">
                      After running the SQL, refresh this page to verify the
                      setup
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.location.reload()}
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SQL Script Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  SQL Script to Run
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySQL}
                    className="flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? "Copied!" : "Copy SQL"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 overflow-x-auto text-sm text-gray-100 bg-gray-900 rounded-lg">
                  <code>{setupSQL}</code>
                </pre>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
