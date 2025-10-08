/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createClient } from "@/app/utils/supabase/client";
import { useAuth } from "@/components/context/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Edit2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Nepali labels mapping + helpers (UI only)
const DONATION_TYPE_LABELS: Record<string, string> = {
  "General Donation": "अक्षयकोष",
  "Seva Donation": "मुठ्ठी दान",
  Annadanam: "गुरुकुलमा",
  "Vastra Danam": "जिन्सी सामग्री",
  "Building Fund": "भण्डारा",
  "Festival Sponsorship": "विशेष पूजा",
  "Puja Sponsorship": "आजीवन सदस्यता",
};

function humanizeDonationType(type?: string) {
  if (!type) return "N/A";
  return String(type)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDisplayDonationType(type?: string | null) {
  if (!type) return "N/A";
  return DONATION_TYPE_LABELS[String(type)] ?? humanizeDonationType(type);
}

const supabase = createClient();

interface UserStats {
  totalEntries: number;
  totalAmountProcessed: number;
  thisMonthEntries: number;
}

interface RecentActivity {
  receipt_number: string;
  donor_name: string;
  donation_type: string;
  amount: number;
  payment_mode: string;
  date: string;
  status: string[];
}

export default function ProfilePage() {
  const { user, appUser } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalEntries: 0,
    totalAmountProcessed: 0,
    thisMonthEntries: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Simplified query approach - fetch receipts with donations
      const { data: receiptsData, error: receiptsError } = await supabase
        .from("receipts")
        .select(
          `
          id,
          created_at,
          receipt_number,
          is_printed,
          is_email_sent,
          donation:donations!inner(
            id,
            amount,
            donation_type,
            payment_mode,
            created_by,
            donor:donors(name)
          )
        `
        )
        .eq("donation.created_by", user.id)
        .order("created_at", { ascending: false });

      if (receiptsError) {
        console.error("Receipts query error:", receiptsError);
        throw receiptsError;
      }

      // Process the data safely
      const receipts = receiptsData || [];

      // Calculate statistics
      const totalEntries = receipts.length;
      const totalAmountProcessed = receipts.reduce(
        (sum: number, receipt: any) => {
          const amount = Array.isArray(receipt.donation)
            ? receipt.donation[0]?.amount || 0
            : receipt.donation?.amount || 0;
          return sum + amount;
        },
        0
      );

      // Get this month's entries
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthEntries = receipts.filter(
        (receipt: any) => new Date(receipt.created_at) >= thisMonth
      ).length;

      setUserStats({
        totalEntries,
        totalAmountProcessed,
        thisMonthEntries,
      });

      // Format recent activity (last 4 entries)
      const formattedActivity: RecentActivity[] = receipts
        .slice(0, 4)
        .map((receipt: any) => {
          const donation = Array.isArray(receipt.donation)
            ? receipt.donation[0]
            : receipt.donation;

          const donor = Array.isArray(donation?.donor)
            ? donation.donor[0]
            : donation?.donor;

          return {
            receipt_number: receipt.receipt_number || "N/A",
            donor_name: donor?.name || "Unknown",
            // display Nepali label (UI only) while keeping backend key intact elsewhere
            donation_type:
              getDisplayDonationType(donation?.donation_type) || "N/A",
            amount: donation?.amount || 0,
            payment_mode: donation?.payment_mode || "Cash",
            date: new Date(receipt.created_at).toLocaleDateString("en-GB"),
            status: [
              ...(receipt.is_printed ? ["Printed"] : []),
              ...(receipt.is_email_sent ? ["Emailed"] : []),
            ],
          };
        });

      setRecentActivity(formattedActivity);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Set empty data on error
      setUserStats({
        totalEntries: 0,
        totalAmountProcessed: 0,
        thisMonthEntries: 0,
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && appUser) {
      fetchUserData();
    }
  }, [user?.id, appUser, fetchUserData]);

  if (!user?.id || !appUser) {
    return (
      <div className="flex items-center justify-center h-64 p-6">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-b-2 border-orange-500 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "billing staff":
      case "user":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount: number) => {
    return `Rs. ${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">
          Manage your account settings and view your activity
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <div className="flex items-center justify-center w-5 h-5 bg-orange-600 rounded">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                Profile Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                Your account details and contact information
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20 text-xl font-bold text-orange-800 bg-orange-100">
                  <AvatarFallback className="text-xl font-bold text-orange-800 bg-orange-100">
                    {getInitials(appUser.name || "U")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1 font-medium text-gray-900">
                      {appUser.name}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Full name cannot be edited. Contact administrator if
                      changes are needed.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-gray-900">{user.email}</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={`${getRoleBadgeColor(
                          appUser.role
                        )} border-0`}
                      >
                        {appUser.role === "user"
                          ? "Billing Staff"
                          : appUser.role}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Member Since
                    </label>
                    <div className="mt-1 text-gray-900">
                      {new Date(appUser.created_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Permissions
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full">
                        Manage Donors
                      </span>
                      <span className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full">
                        Manage Receipts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Statistics */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Statistics</CardTitle>
              <p className="text-sm text-gray-600">
                Overview of your contributions
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {userStats.totalEntries}
                    </div>
                    <div className="text-sm text-gray-600">Total Entries</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatAmount(userStats.totalAmountProcessed)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Amount Processed
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {userStats.thisMonthEntries}
                    </div>
                    <div className="text-sm text-gray-600">This Month</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Your Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
          <p className="text-sm text-gray-600">
            Track all the entries and activities you&apos;ve performed
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 border-b">
            <div className="flex space-x-8">
              <button className="pb-2 font-medium text-orange-600 border-b-2 border-orange-500">
                Receipt Entries
              </button>
              <button className="pb-2 text-gray-600 hover:text-gray-900">
                Recent Activity
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-left text-gray-600">
                    <th className="pb-3">Receipt No.</th>
                    <th className="pb-3">Donor Name</th>
                    <th className="pb-3">Donation Type</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment Mode</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-3">{activity.receipt_number}</td>
                        <td className="py-3">{activity.donor_name}</td>
                        <td className="py-3">{activity.donation_type}</td>
                        <td className="py-3 font-medium">
                          {formatAmount(activity.amount)}
                        </td>
                        <td className="py-3">
                          {activity.payment_mode === "online" ? (
                            <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
                              Online
                            </span>
                          ) : activity.payment_mode === "qr_payment" ? (
                            <span className="px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded">
                              QR Payment
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded">
                              Offline
                            </span>
                          )}
                        </td>
                        <td className="py-3">{activity.date}</td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            {activity.status.includes("Printed") && (
                              <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                                Printed
                              </span>
                            )}
                            {activity.status.includes("Emailed") && (
                              <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
                                Emailed
                              </span>
                            )}
                            {activity.status.length === 0 && (
                              <span className="px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded">
                                Pending
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-gray-500"
                      >
                        No recent activity found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
