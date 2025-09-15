"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Donor } from "@/types";
import {
  Calendar,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";

interface DonorProfileModalProps {
  donor: Donor | null;
  isOpen: boolean;
  onClose: () => void;
  donorHistory?: Array<{
    id: string;
    amount: number;
    donation_type: string;
    payment_mode: string;
    date_of_donation: string;
    notes?: string;
    receipt_number?: string;
  }>;
  loadingHistory?: boolean;
}

export default function DonorProfileModal({
  donor,
  isOpen,
  onClose,
  donorHistory = [],
  loadingHistory = false,
}: DonorProfileModalProps) {
  if (!donor) return null;

  // Use real donor history data instead of mock data
  const totalDonations = donorHistory.reduce(
    (total, donation) => total + (donation.amount || 0),
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">{donor.name}</DialogTitle>
                <DialogDescription className="text-base">
                  Donor Profile & Information
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="text-white bg-gradient-to-r from-green-500 to-green-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Donations</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(totalDonations)}
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="text-white bg-gradient-to-r from-blue-500 to-blue-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Receipts</p>
                    <p className="text-2xl font-bold">{donorHistory.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="text-white bg-gradient-to-r from-purple-500 to-purple-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Member Since</p>
                    <p className="text-lg font-semibold">
                      {formatDate(new Date(donor.createdAt || "2024-01-01"))}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-orange-600" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">
                      {donor.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">
                      {donor.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Joined</p>
                    <p className="text-gray-600">
                      {formatDate(new Date(donor.createdAt || "2024-01-01"))}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">
                      {donor.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Donation Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <p className="text-sm text-orange-600">Highest Donation</p>
                    <p className="text-lg font-semibold text-orange-800">
                      {donorHistory.length > 0
                        ? formatCurrency(
                            Math.max(...donorHistory.map((d) => d.amount))
                          )
                        : formatCurrency(0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-sm text-green-600">Average Donation</p>
                    <p className="text-lg font-semibold text-green-800">
                      {donorHistory.length > 0
                        ? formatCurrency(totalDonations / donorHistory.length)
                        : formatCurrency(0)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-50">
                  <p className="mb-2 text-sm text-blue-600">Recent Activity</p>
                  <p className="text-blue-800">
                    Last donation:{" "}
                    {donorHistory.length > 0
                      ? formatDate(new Date(donorHistory[0].date_of_donation))
                      : "No donations yet"}
                  </p>
                  <p className="text-blue-800">
                    Amount:{" "}
                    {donorHistory.length > 0
                      ? formatCurrency(donorHistory[0].amount)
                      : formatCurrency(0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading donation history...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donorHistory.length > 0 ? (
                      donorHistory.map((donation, index) => (
                        <TableRow key={donation.id}>
                          <TableCell className="font-medium">
                            {donation.receipt_number || `REC-${index + 1}`}
                          </TableCell>
                          <TableCell>
                            {formatDate(new Date(donation.date_of_donation))}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {donation.donation_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-right">
                            {formatCurrency(donation.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-8 text-center text-gray-500"
                        >
                          No donation history found for this donor.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
