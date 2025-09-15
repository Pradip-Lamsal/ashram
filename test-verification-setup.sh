#!/bin/bash

# Test script to verify Supabase configuration
echo "🔍 Testing Supabase Email Verification Setup..."
echo ""

# Check if server is running
echo "1. Checking if Next.js server is running on port 3001..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Server is running on http://localhost:3001"
else
    echo "❌ Server is not running. Please start with: npm run dev"
    exit 1
fi

# Check if auth callback route exists
echo ""
echo "2. Checking auth callback route..."
if curl -s http://localhost:3001/auth/callback > /dev/null; then
    echo "✅ Auth callback route is accessible"
else
    echo "❌ Auth callback route not found"
fi

# Check if verify-success page exists
echo ""
echo "3. Checking verify-success page..."
if curl -s http://localhost:3001/auth/verify-success > /dev/null; then
    echo "✅ Verify-success page is accessible"
else
    echo "❌ Verify-success page not found"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to Authentication > URL Configuration"
echo "3. Set Site URL to: http://localhost:3001"
echo "4. Add these Redirect URLs:"
echo "   - http://localhost:3001/auth/callback"
echo "   - http://localhost:3001/auth/verify-success"
echo "5. Save the settings"
echo ""
echo "🧪 To test:"
echo "1. Register a new user at: http://localhost:3001/register"
echo "2. Check email for verification link"
echo "3. Click the link - should redirect to verify-success page"
echo ""
