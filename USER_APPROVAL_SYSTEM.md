# User Approval System Implementation

## Overview

This document outlines the comprehensive user approval system implemented for the Ashram Management application. The system ensures that only approved users can access the dashboard and other protected pages.

## Features Implemented

### 1. User Status Management

- **Status Types**: `pending`, `approved`, `rejected`
- **Default Status**: All new users start with `pending` status
- **Database Integration**: Status column with proper constraints and triggers

### 2. Approval Pending Page (`/approval-pending`)

- **Location**: `/app/approval-pending/page.tsx`
- **Features**:
  - Real-time status monitoring using Supabase subscriptions
  - Automatic redirect to dashboard when approved
  - Comprehensive UI for pending and rejected states
  - Manual status check functionality
  - Sign out capability
  - Email contact information for support

### 3. Protected Route System

- **Component**: `/components/auth/ProtectedRoute.tsx`
- **Features**:
  - Authentication verification
  - Status-based access control
  - Admin role verification for admin routes
  - Automatic redirects based on user status

### 4. Dashboard Layout Integration

- **Component**: `/components/layout/DashboardLayout.tsx`
- **Features**:
  - Integrated with ProtectedRoute
  - Admin route detection
  - Status-based access control

### 5. Authentication Flow Updates

- **Component**: `/components/context/AuthProvider.tsx`
- **Features**:
  - Status-aware redirects after login
  - Real-time user profile updates
  - Proper handling of pending/rejected users

## Database Schema Updates

### Status Column

```sql
-- Status column with constraints
ALTER TABLE public.users
ALTER COLUMN status SET DEFAULT 'pending';

-- Check constraint
ALTER TABLE public.users
ADD CONSTRAINT users_status_check
CHECK (status IN ('pending', 'approved', 'rejected'));
```

### Trigger Function

```sql
-- Updated handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, name, email, role, status, email_verified, join_date, created_at, updated_at
  ) VALUES (
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
    NOW(), NOW(), NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## User Journey

### New User Registration

1. User registers via `/register` page
2. User receives email verification link
3. After email verification, user is redirected to `/approval-pending`
4. User sees pending status message with real-time updates
5. Admin can approve/reject user via admin panel
6. Upon approval, user is automatically redirected to dashboard

### Login Flow for Existing Users

1. User attempts to log in via `/login` page
2. Authentication Provider checks user status:
   - **Pending/Rejected**: Redirect to `/approval-pending`
   - **Approved**: Redirect to `/dashboard`

### Protected Pages Access

1. All dashboard routes are protected by `ProtectedRoute`
2. User status is checked before granting access
3. Only approved users can access dashboard features
4. Admin routes require both approval and admin role

## Admin Panel Integration

### User Management Features

- View all users with their status
- Search and filter users
- Update user status (approve/reject/pending)
- Real-time user table updates
- Bulk operations support

### Status Management

- One-click status changes
- Visual status indicators
- Confirmation dialogs for critical actions
- Activity logging (can be extended)

## Security Features

### Row Level Security (RLS)

- Users can only view their own profile
- Users cannot change their own status or role
- Admins have full access to user management
- Status changes logged and auditable

### Authentication Guards

- All routes protected by authentication
- Status-based access control
- Admin-only routes secured
- Automatic redirects for unauthorized access

## Real-time Updates

### Supabase Subscriptions

- User status changes trigger automatic updates
- Real-time dashboard updates for admins
- Live status monitoring on pending page
- Automatic redirects when status changes

## UI/UX Features

### Approval Pending Page

- Comprehensive status display
- Clear messaging for different states
- Action buttons for user interaction
- Responsive design matching application theme
- Error handling and loading states

### Admin Interface

- Intuitive user management
- Visual status indicators
- Quick action buttons
- Search and filter capabilities
- Real-time data updates

## Configuration Files

### Database Migration

- **File**: `/database/update-pending-status-default.sql`
- **Purpose**: Set up status column, constraints, and triggers
- **Usage**: Run this SQL in Supabase dashboard

### Component Structure

```
/app/approval-pending/page.tsx          # Pending approval page
/components/auth/ProtectedRoute.tsx     # Route protection
/components/layout/DashboardLayout.tsx  # Protected dashboard layout
/components/context/AuthProvider.tsx    # Authentication context
/app/(dashboard)/admin/page.tsx         # Admin user management
```

## Testing the System

### Test New User Flow

1. Register a new user
2. Verify email
3. Attempt to access dashboard → Should redirect to pending page
4. Admin approves user
5. User should auto-redirect to dashboard

### Test Status Changes

1. Admin changes user status to rejected
2. User should see rejection message
3. Admin changes status back to approved
4. User should auto-redirect to dashboard

### Test Admin Access

1. Only approved admin users can access `/admin`
2. User role and status both required
3. Regular users cannot access admin features

## Next Steps (Optional Enhancements)

1. **Email Notifications**: Send emails when status changes
2. **Application Notes**: Allow admins to add notes to user applications
3. **Approval Workflow**: Multi-step approval process
4. **User Profile Completion**: Require profile completion before approval
5. **Analytics Dashboard**: Track approval rates and user onboarding

## Support and Maintenance

### Monitoring

- Check Supabase logs for authentication errors
- Monitor user table for status distribution
- Track approval/rejection rates

### Common Issues

- **Users stuck in pending**: Check trigger function execution
- **Approval not working**: Verify admin permissions and RLS policies
- **Redirects not working**: Check AuthProvider status handling

This implementation provides a robust, secure, and user-friendly approval system that ensures proper access control while maintaining a smooth user experience.
