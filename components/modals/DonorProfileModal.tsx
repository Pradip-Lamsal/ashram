"use client";

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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockReceipts } from "@/data/mockData";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Donor } from "@/types";
import {
  Calendar,
  Download,
  Edit,
  Heart,
  Mail,
  MapPin,
  Phone,
  Receipt,
  User,
} from "lucide-react";
import { useState } from "react";

interface DonorProfileModalProps {
  donor: Donor;
  isOpen: boolean;
  onClose: () => void;
}

export default function DonorProfileModal({
  donor,
  isOpen,
  onClose,
}: DonorProfileModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Get donor's receipts
  const donorReceipts = mockReceipts.filter(
    (receipt) => receipt.donorId === donor.id
  );

  // Calculate statistics
  const totalDonations = donorReceipts.length;
  const totalAmount = donorReceipts.reduce(
    (sum, receipt) => sum + receipt.amount,
    0
  );
  const averageAmount = totalAmount / totalDonations || 0;
  const lastDonation = donorReceipts.sort(
    (a, b) =>
      new Date(b.dateOfDonation).getTime() -
      new Date(a.dateOfDonation).getTime()
  )[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{donor.name}</span>
          </DialogTitle>
          <DialogDescription>
            Complete donor profile with donation history and details
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donations">Donation History</TabsTrigger>
            <TabsTrigger value="pujas">Puja History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Personal Information</span>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">{donor.name}</p>
                        <p className="text-sm text-gray-500">Full Name</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {formatDate(donor.dateOfBirth)}
                        </p>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">{donor.phone}</p>
                        <p className="text-sm text-gray-500">Phone Number</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {donor.email && (
                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{donor.email}</p>
                          <p className="text-sm text-gray-500">Email Address</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">{donor.address}</p>
                        <p className="text-sm text-gray-500">Address</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Heart className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">{donor.membership} Member</p>
                        <p className="text-sm text-gray-500">Membership Type</p>
                      </div>
                    </div>
                  </div>
                </div>

                {donor.notes && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-700">{donor.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {totalDonations}
                  </div>
                  <div className="text-sm text-gray-600">Total Donations</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(averageAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Average Amount</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {lastDonation
                      ? formatDate(lastDonation.dateOfDonation)
                      : "Never"}
                  </div>
                  <div className="text-sm text-gray-600">Last Donation</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="donations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Donation History</span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>
                  Complete history of all donations made by {donor.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {donorReceipts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt No.</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donorReceipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium">
                            {receipt.receiptNumber}
                          </TableCell>
                          <TableCell>
                            {formatDate(receipt.dateOfDonation)}
                          </TableCell>
                          <TableCell>{receipt.donationType}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(receipt.amount)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                receipt.paymentMode === "Online"
                                  ? "bg-blue-100 text-blue-800"
                                  : receipt.paymentMode === "QR Payment"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {receipt.paymentMode}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Receipt className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No donations found for this donor.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pujas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Puja History</CardTitle>
                <CardDescription>
                  Pujas sponsored or participated by {donor.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No puja history available.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Puja history will be displayed here once the donor
                    participates in any pujas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
