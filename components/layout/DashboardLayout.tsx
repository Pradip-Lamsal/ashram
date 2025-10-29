"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Heart,
  Home,
  LogOut,
  Menu,
  Receipt,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["admin", "user"],
  },
  {
    name: "Admin Panel",
    href: "/admin",
    icon: Shield,
    roles: ["admin"],
  },
  {
    name: "Events & SMS",
    href: "/events",
    icon: Calendar,
    roles: ["admin", "user"],
  },
  {
    name: "Donors",
    href: "/donors",
    icon: Users,
    roles: ["admin", "user"],
  },
  {
    name: "Receipts",
    href: "/receipts",
    icon: Receipt,
    roles: ["admin", "user"],
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    roles: ["admin", "user"],
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // Check if this is admin route
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <ProtectedRoute requireApproval={true} requireAdmin={isAdminRoute}>
      <DashboardContent>{children}</DashboardContent>
    </ProtectedRoute>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, appUser, signOut } = useAuth();

  // Show loading immediately if no user or appUser
  if (!user || !appUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect if not authenticated (only after we know there's no user)
  if (!user) {
    router.push("/login");
    return null;
  }

  const userRole = appUser.role;
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  const formatRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      console.log("Triggering signOut from DashboardLayout...");
      await signOut();
      // AuthProvider will handle the redirect
    } catch (error) {
      console.error("Error during sign out:", error);
      // Force redirect even if sign out fails
      router.push("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative px-4 py-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center flex-1 min-w-0 space-x-3">
              <div className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm">
                <Heart className="w-6 h-6 text-orange-500 fill-current" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold leading-relaxed text-orange-900">
                  श्री जगद्गुरु आश्रम एवं जगत्-नारायाण मन्दिर व्यवस्थापन तथा
                  सञ्चालन समिति
                </h1>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 ml-3 lg:hidden hover:bg-orange-200/50"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-orange-700" />
            </Button>
          </div>

          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-300 via-orange-500 to-orange-300"></div>
        </div>

        <nav className="px-3 mt-6">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-orange-100 text-orange-700 border-r-2 border-orange-500"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive
                        ? "text-orange-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {appUser.name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-orange-600">
                  {formatRoleName(appUser.role)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="w-8 h-8"
              title="Sign out"
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <div className="w-4 h-4 border-b-2 border-gray-400 rounded-full animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation - Mobile only */}
        <header className="bg-white border-b border-gray-200 shadow-sm lg:hidden">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <div className="w-4 h-4 border-b-2 border-gray-400 rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
