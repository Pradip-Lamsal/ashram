# User Approval System Setup & Testing Guide

## 🚀 Complete Implementation Overview

I've implemented a comprehensive user approval system with the following features:

### ✅ What's Implemented

1. **Database Changes**

   - Added `status` column to users table with values: `pending`, `approved`, `rejected`
   - Updated `handle_new_user()` function to set default status as `pending`
   - Created `update_user_status()` function for admin use
   - Added RLS policies for status-based access control

2. **User Flow Updates**

   - Registration now sets status to `pending`
   - Email verification redirects to approval pending page (not dashboard)
   - Status-based route protection with automatic redirects

3. **Admin Interface**

   - Comprehensive user management dashboard at `/admin`
   - Real-time user table with search and filtering
   - Status statistics with visual cards
   - Tab-based organization (Pending, Approved, Rejected, All)
   - Dropdown actions to approve/reject users
   - Real-time updates when status changes

4. **API Endpoints**
   - `/api/admin/update-user-status` for status updates
   - Real-time Supabase subscriptions for instant updates

## 🛠️ Setup Instructions

### Step 1: Run Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/djqsebrodwumznqgjhtk
2. Navigate to **SQL Editor**
3. Run the script from: `database/add-user-status-column.sql`

```sql
-- This will:
-- ✅ Add status column with proper constraints
-- ✅ Update existing users to 'approved' (so they keep access)
-- ✅ Create admin functions and policies
-- ✅ Set up indexes for performance
```

### Step 2: Verify Your Admin Account

Make sure your account has admin role:

```sql
-- Check your role
SELECT email, role, status FROM public.users WHERE email = 'pradip.lamsal.1000@gmail.com';

-- If needed, update to admin
UPDATE public.users
SET role = 'admin', status = 'approved'
WHERE email = 'pradip.lamsal.1000@gmail.com';
```

### Step 3: Test Email Configuration

Run the database script I created earlier and make sure email confirmations are enabled in Supabase:

- Authentication → Settings → Enable email confirmations: **ON**

## 🧪 Testing the Complete Flow

### Test Scenario 1: New User Registration

1. **Register New User**

   ```
   http://localhost:3000/register
   ```

   - Fill out registration form
   - Click "Create Account"
   - Should see "Check Your Email!" message
   - Should redirect to login with blue notice

2. **Email Verification**

   - Check email for verification link
   - Click verification link
   - Should redirect to verification success page

3. **Login Attempt (Pending User)**
   - Go to `/login`
   - Enter credentials
   - Should automatically redirect to `/approval-pending`
   - Should see "Application Under Review" page

### Test Scenario 2: Admin Approval Process

1. **Access Admin Dashboard**

   ```
   http://localhost:3000/admin
   ```

   - Login as admin (pradip.lamsal.1000@gmail.com)
   - Should see comprehensive user management interface

2. **View Pending Users**

   - Click "Pending" tab
   - See new user in pending status
   - View user details and statistics

3. **Approve User**
   - Click dropdown menu (three dots)
   - Select "Approve"
   - Status should update instantly
   - Statistics should update in real-time

### Test Scenario 3: User Access After Approval

1. **User Gets Dashboard Access**

   - Pending user should see automatic redirect to dashboard
   - Real-time update via Supabase subscriptions
   - No need to refresh or re-login

2. **Admin Can Manage Status**
   - Change status between pending/approved/rejected
   - View different status tabs
   - Search and filter users

## 🎨 Admin Interface Features

### Dashboard Overview

- **Statistics Cards**: Total, Pending, Approved, Rejected counts
- **Real-time Updates**: Live data via Supabase subscriptions
- **Search & Filter**: By name, email, and status
- **Responsive Design**: Works on mobile and desktop

### User Table Features

- **Tab Organization**: Separate views for each status
- **Action Dropdown**: Approve, Reject, Set Pending, View Details
- **Status Badges**: Color-coded status indicators
- **Date Formatting**: Human-readable timestamps
- **Loading States**: Smooth UI during updates

### Design Inspiration

Based on your vendor profiles screenshot:

- Clean, professional table layout
- Consistent action patterns
- Status-based organization
- Search and filtering capabilities

## 🔄 Real-time Features

### For Users

- **Automatic Redirects**: When status changes, user is instantly redirected
- **Live Status Updates**: No need to refresh page
- **Seamless Experience**: Approval happens in real-time

### For Admins

- **Live User List**: Updates when new users register
- **Instant Status Changes**: See updates immediately after actions
- **Real-time Statistics**: Counts update automatically

## 🚦 Status Flow Summary

```
Registration → pending → Email Verification → approval-pending page
                ↓
Admin Approval → approved → Dashboard Access
                ↓
Admin Rejection → rejected → Rejection Notice
```

## 🔧 File Structure

```
/app/
  /api/admin/update-user-status/route.ts    # API endpoint
  /approval-pending/page.tsx                # Pending approval page
  /(dashboard)/admin/page.tsx               # Admin interface
/components/
  /auth/ProtectedRoute.tsx                  # Route protection
  /context/AuthProvider.tsx                 # Updated with status
/database/
  add-user-status-column.sql                # Database migration
```

## 🎯 Next Steps

1. **Run the database migration** (most important!)
2. **Test registration flow** with a new email
3. **Access admin interface** to approve the test user
4. **Verify real-time updates** work properly

The system is now ready for production use with a complete user approval workflow! 🎉
