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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Automatically set role as billing-staff
    const registrationData = {
      ...formData,
      role: "billing-staff",
    };

    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      router.push("/login");
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/register-image.jpg"
          alt="Ashram Register"
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
            <h1 className="text-3xl font-bold mb-2">Join Our Mission</h1>
            <p className="text-lg opacity-90">
              Be part of the divine service journey
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-8 w-8 text-orange-500" />
              <h1 className="text-xl font-bold text-gray-900 ml-2">Ashram</h1>
            </div>
            <p className="text-gray-600 text-sm">
              Begin your journey of service
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-xl lg:text-2xl font-bold text-center text-gray-900">
                Create Account
              </CardTitle>
              <p className="text-center text-gray-600 text-sm">
                Join our ashram management system
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="space-y-1">
                  <Label
                    htmlFor="name"
                    className="text-gray-700 font-medium text-sm"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="h-9 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

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
                    placeholder="your.email@ashram.org"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-9 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                      className="h-9 pr-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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

                <div className="space-y-1">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-700 font-medium text-sm"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      required
                      className="h-9 pr-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-0.5"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-xs text-gray-600 leading-4"
                  >
                    I agree to the{" "}
                    <Link
                      href="#"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="#"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-9 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center pt-1">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-3 text-center text-xs text-gray-500">
            <p>© 2025 Ashram Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
