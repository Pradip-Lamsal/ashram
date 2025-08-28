"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockReceipts, mockUsers } from "@/data/mockData";
import type { User, UserRole } from "@/types";
import {
  Check,
  Edit,
  Mail,
  Receipt as ReceiptIcon,
  Shield,
  TrendingUp,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { useState } from "react";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("Billing Staff");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  // Filter out admin users for role management
  const nonAdminUsers = users.filter((user) => user.role !== "Admin");
  const adminUsers = users.filter((user) => user.role === "Admin");

  // Calculate stats
  const totalUsers = users.length;
  const totalAdmins = adminUsers.length;
  const billingStaffCount = users.filter(
    (user) => user.role === "Billing Staff"
  ).length;
  const eventCoordinatorCount = users.filter(
    (user) => user.role === "Event Coordinator"
  ).length;

  // Bills created by billing staff
  const billsByBillingStaff = mockReceipts.filter((receipt) =>
    users.some(
      (user) => user.role === "Billing Staff" && user.name === receipt.createdBy
    )
  );

  // Calculate billing stats
  const totalBillsAmount = billsByBillingStaff.reduce(
    (sum, receipt) => sum + receipt.amount,
    0
  );
  const totalBillsCount = billsByBillingStaff.length;

  // Group bills by staff member
  const billsByStaff = users
    .filter((user) => user.role === "Billing Staff")
    .map((staff) => {
      const staffBills = billsByBillingStaff.filter(
        (bill) => bill.createdBy === staff.name
      );
      const totalAmount = staffBills.reduce(
        (sum, bill) => sum + bill.amount,
        0
      );
      return {
        staff,
        bills: staffBills,
        totalAmount,
        billCount: staffBills.length,
      };
    });

  const handleRoleUpdate = () => {
    if (!selectedUser) return;

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              role: newRole,
              permissions: getPermissionsForRole(newRole),
            }
          : user
      )
    );

    setIsRoleDialogOpen(false);
    setSelectedUser(null);
  };

  const getPermissionsForRole = (role: UserRole): string[] => {
    switch (role) {
      case "Admin":
        return [
          "manage_donors",
          "manage_receipts",
          "manage_events",
          "manage_users",
        ];
      case "Billing Staff":
        return ["manage_donors", "manage_receipts"];
      case "Event Coordinator":
        return ["manage_events"];
      default:
        return [];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "Billing Staff":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Event Coordinator":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">
            Manage user roles, monitor staff activities, and oversee system
            operations
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Admins
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAdmins}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Billing Staff
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {billingStaffCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Event Coordinators
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {eventCoordinatorCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="bills">Billing Activities</TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UsersIcon className="w-5 h-5 text-orange-600" />
                <span>User Role Management</span>
              </CardTitle>
              <CardDescription>
                Manage user roles and permissions for non-admin users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Email Status</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nonAdminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-orange-700 bg-orange-100">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.joinDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {user.emailVerified ? (
                              <div className="flex items-center space-x-1 text-green-600">
                                <Check className="w-4 h-4" />
                                <span className="text-sm">Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-amber-600">
                                <X className="w-4 h-4" />
                                <span className="text-sm">Pending</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.permissions.map((permission) => (
                              <Badge
                                key={permission}
                                variant="outline"
                                className="text-xs"
                              >
                                {permission
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog
                            open={
                              isRoleDialogOpen && selectedUser?.id === user.id
                            }
                            onOpenChange={(open) => {
                              setIsRoleDialogOpen(open);
                              if (!open) setSelectedUser(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.role);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit Role
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update User Role</DialogTitle>
                                <DialogDescription>
                                  Change the role for {user.name}. This will
                                  update their permissions accordingly.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">
                                    New Role
                                  </label>
                                  <Select
                                    value={newRole}
                                    onValueChange={(value: UserRole) =>
                                      setNewRole(value)
                                    }
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Billing Staff">
                                        Billing Staff
                                      </SelectItem>
                                      <SelectItem value="Event Coordinator">
                                        Event Coordinator
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsRoleDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={handleRoleUpdate}>
                                    Update Role
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Activities Tab */}
        <TabsContent value="bills" className="mt-6">
          <div className="space-y-6">
            {/* Billing Overview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ReceiptIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Bills
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalBillsCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalBillsAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <UsersIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active Staff
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {billingStaffCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Staff Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Staff Performance</CardTitle>
                <CardDescription>
                  Overview of bills created by each billing staff member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Bills Created</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Average Amount</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billsByStaff.map(({ staff, totalAmount, billCount }) => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-blue-700 bg-blue-100">
                                  {staff.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {staff.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {staff.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{billCount}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">
                              {formatCurrency(totalAmount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {billCount > 0
                              ? formatCurrency(totalAmount / billCount)
                              : "₹0"}
                          </TableCell>
                          <TableCell>{formatDate(staff.joinDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {staff.emailVerified ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <Check className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bills */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bills by Billing Staff</CardTitle>
                <CardDescription>
                  Latest receipts created by billing staff members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt No.</TableHead>
                        <TableHead>Donor Name</TableHead>
                        <TableHead>Donation Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billsByBillingStaff.slice(0, 10).map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium">
                            {receipt.receiptNumber}
                          </TableCell>
                          <TableCell>{receipt.donorName}</TableCell>
                          <TableCell>{receipt.donationType}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(receipt.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                receipt.paymentMode === "Online"
                                  ? "default"
                                  : receipt.paymentMode === "QR Payment"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {receipt.paymentMode}
                            </Badge>
                          </TableCell>
                          <TableCell>{receipt.createdBy}</TableCell>
                          <TableCell>
                            {formatDate(receipt.dateOfDonation)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {receipt.isPrinted && (
                                <Badge
                                  variant="outline"
                                  className="text-green-600 border-green-200"
                                >
                                  Printed
                                </Badge>
                              )}
                              {receipt.isEmailSent && (
                                <Badge
                                  variant="outline"
                                  className="text-blue-600 border-blue-200"
                                >
                                  Emailed
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
