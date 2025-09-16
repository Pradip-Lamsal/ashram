"use client";

import { createClient } from "@/app/utils/supabase/client";
import { useAuth } from "@/components/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut, Mail, RefreshCw, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const supabase = createClient();

export default function ApprovalPendingPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const checkUserStatus = useCallback(async () => {
    if (!user) return;

    setCheckingStatus(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("status, name, email")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user status:", error);
        return;
      }

      setUserStatus(data.status);

      // If user is approved, redirect to dashboard
      if (data.status === "approved") {
        router.push("/dashboard");
      } else if (data.status === "rejected") {
        // Handle rejected status
        console.log("User application was rejected");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCheckingStatus(false);
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    checkUserStatus();

    // Set up real-time subscription to listen for status changes
    const channel = supabase
      .channel("user-status-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newStatus = (payload.new as any)?.status;
          setUserStatus(newStatus);

          if (newStatus === "approved") {
            // Show success message and redirect
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, router, checkUserStatus]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleCheckStatus = () => {
    checkUserStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (userStatus === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Application Rejected
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-3">
              <p className="text-gray-600">
                Unfortunately, your application to join Ashram Management System
                has been rejected by our administrators.
              </p>
              <p className="text-sm text-gray-500">
                If you believe this is an error, please contact our support team
                for assistance.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-red-700">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Contact: support@ashrammanagement.com
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={handleSignOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-orange-600 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Application Under Review
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Your registration is being processed
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">
                Welcome to Ashram Management System!
              </h3>
              <p className="text-gray-600 text-sm">
                Thank you for registering. Your application is currently being
                reviewed by our administrators.
              </p>
              <p className="text-gray-600 text-sm">
                You will receive access to the dashboard once your account is
                approved.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">
                  You will be notified via email once approved
                </span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-orange-700 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  Current Status:{" "}
                  {userStatus === "pending" ? "Pending Review" : "Processing"}
                </span>
              </div>
              <p className="text-xs text-orange-600">
                This page will automatically update when your status changes
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleCheckStatus}
              variant="outline"
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Check Status
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Need help? Contact support@ashrammanagement.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
