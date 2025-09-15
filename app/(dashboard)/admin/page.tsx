"use client";

import { useAuth } from "@/components/context/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dashboardService, usersService } from "@/lib/supabase-services";
import {
  DollarSign,
  Receipt,
  RefreshCw,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Lazy load heavy components
const DataTable = dynamic(
  () => import("@/components/ui/table").then((mod) => ({ default: mod.Table })),
  {
    ssr: false,
    loading: () => <TableSkeleton />,
  }
);

interface User {
  id: string;
  name: string;
  role: string;
  email_verified: boolean;
  join_date: string;
}

interface Donor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  total_donations: number;
  last_donation_date?: string;
  membership: string;
}

interface Receipt {
  id: string;
  receipt_number: string;
  issued_at: string;
  is_printed: boolean;
  is_email_sent: boolean;
  donation?: {
    amount: number;
    donor?: {
      name: string;
    };
  };
}

interface Donation {
  id: string;
  amount: number;
  donation_type: string;
  payment_mode: string;
  date_of_donation: string;
  notes?: string;
  donor?: {
    name: string;
  };
}

interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  location?: string;
  created_at: string;
}

interface AdminData {
  users: User[];
  donors: Donor[];
  receipts: Receipt[];
  donations: Donation[];
  events: Event[];
}

interface DashboardStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalDonors: number;
  totalDonations: number;
  totalReceipts: number;
  totalEvents: number;
  totalAmount: number;
}

export default function AdminPage() {
  const { appUser } = useAuth();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchAdminData = async () => {
    try {
      setDataLoading(true);
      const [overview, statsData] = await Promise.all([
        dashboardService.getAdminOverview(),
        dashboardService.getStats(),
      ]);
      setAdminData(overview);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await usersService.updateRole(userId, newRole);
      await fetchAdminData(); // Refresh data
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  useEffect(() => {
    if (appUser?.role === "admin") {
      fetchAdminData();
    }
  }, [appUser]);

  if (dataLoading) {
    return (
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (!appUser || appUser.role !== "admin") {
    return (
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You need admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">
            System administration and management dashboard
          </p>
        </div>
        <Button onClick={fetchAdminData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalUsers}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.adminUsers} admin, {stats.regularUsers} users
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Donors
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalDonors}
                  </p>
                  <p className="text-xs text-gray-500">Active donors</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Receipts
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.totalReceipts}
                  </p>
                  <p className="text-xs text-gray-500">Generated receipts</p>
                </div>
                <Receipt className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    ₹{stats.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.totalDonations} donations
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Tables */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">
            Users ({adminData?.users.length || 0})
          </TabsTrigger>
          <TabsTrigger value="donors">
            Donors ({adminData?.donors.length || 0})
          </TabsTrigger>
          <TabsTrigger value="receipts">
            Receipts ({adminData?.receipts.length || 0})
          </TabsTrigger>
          <TabsTrigger value="donations">
            Donations ({adminData?.donations.length || 0})
          </TabsTrigger>
          <TabsTrigger value="events">
            Events ({adminData?.events.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                {adminData?.users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.id}</p>
                    </div>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                {adminData?.donations.slice(0, 5).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {donation.donor?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {donation.donation_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ₹{donation.amount}
                      </p>
                      <p className="text-xs text-gray-500">
                        {donation.payment_mode}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">User ID</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Email Verified</th>
                      <th className="text-left p-2">Join Date</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData?.users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{user.name}</td>
                        <td className="p-2 text-sm text-gray-600 font-mono">
                          {user.id}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              user.email_verified ? "default" : "destructive"
                            }
                          >
                            {user.email_verified ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">
                          {new Date(user.join_date).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRoleUpdate(
                                user.id,
                                user.role === "admin" ? "user" : "admin"
                              )
                            }
                          >
                            {user.role === "admin" ? "Make User" : "Make Admin"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donors">
          <Card>
            <CardHeader>
              <CardTitle>All Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Total Donations</th>
                      <th className="text-left p-2">Last Donation</th>
                      <th className="text-left p-2">Membership</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData?.donors.map((donor) => (
                      <tr key={donor.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{donor.name}</td>
                        <td className="p-2">{donor.phone || "-"}</td>
                        <td className="p-2">{donor.email || "-"}</td>
                        <td className="p-2 font-bold text-green-600">
                          ₹{donor.total_donations || 0}
                        </td>
                        <td className="p-2 text-sm">
                          {donor.last_donation_date
                            ? new Date(
                                donor.last_donation_date
                              ).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{donor.membership}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle>All Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Receipt Number</th>
                      <th className="text-left p-2">Donor</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Issued Date</th>
                      <th className="text-left p-2">Printed</th>
                      <th className="text-left p-2">Email Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData?.receipts.map((receipt) => (
                      <tr
                        key={receipt.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2 font-mono font-medium">
                          {receipt.receipt_number}
                        </td>
                        <td className="p-2">
                          {receipt.donation?.donor?.name || "Unknown"}
                        </td>
                        <td className="p-2 font-bold text-green-600">
                          ₹{receipt.donation?.amount || 0}
                        </td>
                        <td className="p-2 text-sm">
                          {new Date(receipt.issued_at).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              receipt.is_printed ? "default" : "secondary"
                            }
                          >
                            {receipt.is_printed ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              receipt.is_email_sent ? "default" : "secondary"
                            }
                          >
                            {receipt.is_email_sent ? "Yes" : "No"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>All Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Donor</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Payment Mode</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData?.donations.map((donation) => (
                      <tr
                        key={donation.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2 font-medium">
                          {donation.donor?.name || "Unknown"}
                        </td>
                        <td className="p-2">{donation.donation_type}</td>
                        <td className="p-2 font-bold text-green-600">
                          ₹{donation.amount}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">
                            {donation.payment_mode}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">
                          {new Date(
                            donation.date_of_donation
                          ).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-sm">{donation.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
            </CardHeader>
            <CardContent>
              {adminData?.events.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No events found
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Location</th>
                        <th className="text-left p-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminData?.events.map((event) => (
                        <tr
                          key={event.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-2 font-medium">{event.name}</td>
                          <td className="p-2">{event.description || "-"}</td>
                          <td className="p-2">
                            {new Date(event.date).toLocaleDateString()}
                          </td>
                          <td className="p-2">{event.location || "-"}</td>
                          <td className="p-2 text-sm">
                            {new Date(event.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
