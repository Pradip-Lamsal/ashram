"use client";

import { createClient } from "@/app/utils/supabase/client";
import { useAuth } from "@/components/context/AuthProvider";
import { useToast } from "@/components/context/ToastProvider";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const supabase = createClient();

export default function LoginPage() {
  const { user, appUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailMessage, setShowEmailMessage] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlError = urlParams.get("error");
    const message = urlParams.get("message");

    if (urlError === "auth-error") {
      setError(
        "There was an error with authentication. Please try logging in again."
      );
    }

    if (message === "check-email") {
      setError("");
      setShowEmailMessage(true);
    }

    if (user && appUser) {
      if (appUser.status === "pending" || appUser.status === "rejected") {
        router.push("/approval-pending");
      } else if (appUser.status === "approved") {
        router.push("/dashboard");
      }
    }
  }, [user, appUser, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // fetch auth user and profile status
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Unable to retrieve user after sign-in");
        setLoading(false);
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("status")
        .eq("id", user.id)
        .single();

      if (profileError) {
        // if profile missing, sign out and show pending
        await supabase.auth.signOut();
        showToast(
          "Access Pending",
          "Your account is not yet approved. Please wait for admin approval."
        );
        router.push("/approval-pending");
        return;
      }

      if (!userProfile || userProfile.status !== "approved") {
        await supabase.auth.signOut();
        showToast(
          "Access Pending",
          "Your account is not yet approved. Please wait for admin approval."
        );
        router.push("/approval-pending");
        return;
      }

      // approved
      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left side - Image */}
      <div className="relative hidden lg:flex lg:w-1/2">
        <Image
          src="/Login-image.jpg"
          alt="Ashram Meditation"
          fill
          className="object-cover"
          priority
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-orange-600/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-8 text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-orange-500 fill-current" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Ashram Management
            </h1>
            <p className="text-xl opacity-90">Seva through Divine Service</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center flex-1 p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              {showEmailMessage && (
                <div className="p-3 text-sm text-blue-600 border border-blue-200 rounded-md bg-blue-50">
                  📧 Please check your email and click the verification link to
                  complete your registration before logging in.
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ashram.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-medium text-white bg-orange-600 hover:bg-orange-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="absolute transform -translate-x-1/2 bottom-4 left-1/2 lg:left-3/4">
          <p className="text-xs text-center text-gray-500">
            © 2025 Ashram Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
