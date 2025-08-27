"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/Login-image.jpg"
          alt="Ashram Login"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-3">
              <Heart className="h-10 w-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Ashram Management</h1>
            <p className="text-lg opacity-90">Seva through Divine Service</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <Heart className="h-8 w-8 text-orange-500" />
              <h1 className="text-xl font-bold text-gray-900 ml-2">Ashram</h1>
            </div>
            <p className="text-gray-600 text-sm">
              Welcome back to the sacred journey
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl lg:text-2xl font-bold text-center text-gray-900">
                Sign In
              </CardTitle>
              <p className="text-center text-gray-600 text-sm">
                Enter your credentials to access your account
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 font-medium text-sm"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@ashram.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium text-sm"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 pr-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="remember" className="text-xs text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="#"
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center pt-2">
                  <p className="text-gray-600 text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/register"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>© 2025 Ashram Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
