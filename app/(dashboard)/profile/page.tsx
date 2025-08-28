"use client";

import { EmailVerificationDialog } from "@/components/modals/EmailVerificationModal";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserByRole, mockReceipts } from "@/data/mockData";
import type { User } from "@/types";
import {
  Check,
  Edit2,
  Mail,
  Receipt as ReceiptIcon,
  Save,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [selectedRole, setSelectedRole] = useState<
    "Admin" | "Billing Staff" | "Event Coordinator"
  >("Billing Staff");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // Get current user based on selected role
  const currentUser: User = getUserByRole(selectedRole);

  // Filter receipts created by current user
  const userCreatedReceipts = mockReceipts.filter(
    (receipt) => receipt.createdBy === currentUser.name
  );

  // Calculate stats
  const totalAmount = userCreatedReceipts.reduce(
    (sum, receipt) => sum + receipt.amount,
    0
  );
  const totalEntries = userCreatedReceipts.length;
  const thisMonthEntries = userCreatedReceipts.filter((receipt) => {
    const receiptDate = new Date(receipt.createdAt);
    const now = new Date();
    return (
      receiptDate.getMonth() === now.getMonth() &&
      receiptDate.getFullYear() === now.getFullYear()
    );
  }).length;
  const [email, setEmail] = useState(currentUser.email);
  const [tempEmail, setTempEmail] = useState(currentUser.email);
  const [emailVerified, setEmailVerified] = useState(currentUser.emailVerified);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  const handleEmailEdit = () => {
    setTempEmail(email);
    setIsEditingEmail(true);
  };

  const handleEmailSave = () => {
    if (tempEmail !== email) {
      setEmail(tempEmail);
      setEmailVerified(false);
      setShowVerificationMessage(true);
      setShowVerificationDialog(true);
      setTimeout(() => setShowVerificationMessage(false), 5000);
    }
    setIsEditingEmail(false);
  };

  const handleEmailCancel = () => {
    setTempEmail(email);
    setIsEditingEmail(false);
  };

  const handleVerificationComplete = () => {
    setEmailVerified(true);
    setShowVerificationMessage(false);
  };

  const handleVerifyNow = () => {
    setShowVerificationDialog(true);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and view your activity
          </p>
        </div>
      </div>

      {/* Email Verification Alert */}
      {showVerificationMessage && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Email Verification Required
              </h3>
              <p className="text-sm text-blue-600">
                We&apos;ve sent a verification link to {email}. Please check
                your inbox and verify your new email address.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Your account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl font-semibold text-orange-700 bg-orange-100">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={currentUser.name}
                      disabled
                      className="cursor-not-allowed bg-gray-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Full name cannot be edited. Contact administrator if
                      changes are needed.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2">
                      {isEditingEmail ? (
                        <div className="flex items-center flex-1 space-x-2">
                          <Input
                            value={tempEmail}
                            onChange={(e) => setTempEmail(e.target.value)}
                            placeholder="Enter new email"
                            type="email"
                          />
                          <Button size="sm" onClick={handleEmailSave}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEmailCancel}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center flex-1 space-x-2">
                          <Input
                            value={email}
                            disabled
                            className="bg-gray-50"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEmailEdit}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-2">
                        {emailVerified ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Check className="w-3 h-3" />
                            <span className="text-xs">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-amber-600">
                            <Mail className="w-3 h-3" />
                            <span className="text-xs">
                              Verification pending
                            </span>
                          </div>
                        )}
                      </div>
                      {!emailVerified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleVerifyNow}
                        >
                          Verify Now
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <div className="flex items-center space-x-2">
                      <Badge className="text-orange-800 bg-orange-100 border-orange-200">
                        <Shield className="w-3 h-3 mr-1" />
                        {currentUser.role}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="joinDate">Member Since</Label>
                    <Input
                      value={formatDate(currentUser.joinDate)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="permissions">Permissions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentUser.permissions.map((permission) => (
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Statistics</CardTitle>
              <CardDescription>Overview of your contributions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 text-center rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-600">
                  {totalEntries}
                </div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>

              <div className="p-4 text-center rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalAmount)}
                </div>
                <div className="text-sm text-gray-600">
                  Total Amount Processed
                </div>
              </div>

              <div className="p-4 text-center rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">
                  {thisMonthEntries}
                </div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
          <CardDescription>
            Track all the entries and activities you&apos;ve performed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="receipts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="receipts">Receipt Entries</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="receipts" className="mt-6">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt No.</TableHead>
                      <TableHead>Donor Name</TableHead>
                      <TableHead>Donation Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userCreatedReceipts.length > 0 ? (
                      userCreatedReceipts.map((receipt) => (
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-8 text-center text-gray-500"
                        >
                          No receipt entries found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <div className="space-y-4">
                {userCreatedReceipts.slice(0, 5).map((receipt) => (
                  <div
                    key={receipt.id}
                    className="flex items-center p-4 space-x-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                      <ReceiptIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        Created receipt for {receipt.donorName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {receipt.donationType} •{" "}
                        {formatCurrency(receipt.amount)} •{" "}
                        {formatDate(receipt.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline">Receipt</Badge>
                  </div>
                ))}
                {userCreatedReceipts.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    No recent activity found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Email Verification Dialog */}
      <EmailVerificationDialog
        isOpen={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        email={email}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}
