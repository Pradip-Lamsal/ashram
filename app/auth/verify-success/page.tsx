"use client";

import { createClient } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const supabase = createClient();

export default function VerifySuccessPage() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    "success" | "error" | "already-verified"
  >("success");
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the current authenticated user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("No authenticated user found:", userError);
          setVerificationStatus("error");
          setIsVerifying(false);
          return;
        }

        // Check if email is verified in Supabase auth
        const isEmailVerified = !!user.email_confirmed_at;

        if (!isEmailVerified) {
          console.error("Email not verified in Supabase auth");
          setVerificationStatus("error");
          setIsVerifying(false);
          return;
        }

        // Update the email verification status in our users table
        const { error: updateError } = await supabase
          .from("users")
          .update({
            email_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          console.error(
            "Error updating user verification status:",
            updateError
          );
          // Even if database update fails, auth verification was successful
        }

        // Get user name for display
        const userName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";

        setUserName(userName);
        setVerificationStatus("success");

        console.log("Email verification completed successfully");
      } catch (error) {
        console.error("Error during email verification process:", error);
        setVerificationStatus("error");
      } finally {
        setIsVerifying(false);
      }
    };

    handleEmailVerification();
  }, []);

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verificationStatus === "success" ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <span className="text-2xl text-red-500">✕</span>
              </div>
            )}
          </div>
          <CardTitle
            className={`text-2xl ${
              verificationStatus === "success"
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {verificationStatus === "success"
              ? "Email Verified Successfully!"
              : "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {verificationStatus === "success" ? (
            <>
              <p className="text-gray-600">
                Hello {userName}! Your email has been successfully verified. You
                can now log in to access your dashboard.
              </p>
              <div className="pt-4">
                <Button
                  onClick={handleLoginRedirect}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  Continue to Login
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600">
                We couldn&apos;t verify your email address. This might be
                because:
              </p>
              <ul className="space-y-1 text-sm text-left text-gray-500">
                <li>• The verification link has expired</li>
                <li>• The link has already been used</li>
                <li>• There was a technical issue</li>
              </ul>
              <div className="pt-4">
                <Button
                  onClick={handleLoginRedirect}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
