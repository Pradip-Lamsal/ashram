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
import { Calendar, Heart, Mail, MapPin, Phone, User, X } from "lucide-react";

interface DonorProfileModalProps {
  donor: Donor | null;
  isOpen: boolean;
  onClose: () => void;
}

const mockDonationHistory = [
  {
    id: 1,
    amount: 5000,
    date: "2024-01-15",
    purpose: "Temple Construction",
    receiptNumber: "REC-2024-001",
  },
  {
    id: 2,
    amount: 2500,
    date: "2024-02-10",
    purpose: "Food Service",
    receiptNumber: "REC-2024-045",
  },
  {
    id: 3,
    amount: 1000,
    date: "2024-03-05",
    purpose: "Festival Celebration",
    receiptNumber: "REC-2024-089",
  },
];

export default function DonorProfileModal({
  donor,
  isOpen,
  onClose,
}: DonorProfileModalProps) {
  if (!donor) return null;

  const totalDonations = mockDonationHistory.reduce(
    (total, donation) => total + donation.amount,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
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

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Receipts</p>
                    <p className="text-2xl font-bold">
                      {mockDonationHistory.length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
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
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-600">Highest Donation</p>
                    <p className="text-lg font-semibold text-orange-800">
                      {formatCurrency(
                        Math.max(...mockDonationHistory.map((d) => d.amount))
                      )}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-600">Average Donation</p>
                    <p className="text-lg font-semibold text-green-800">
                      {formatCurrency(
                        totalDonations / mockDonationHistory.length
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-2">Recent Activity</p>
                  <p className="text-blue-800">
                    Last donation:{" "}
                    {formatDate(new Date(mockDonationHistory[0].date))}
                  </p>
                  <p className="text-blue-800">
                    Amount: {formatCurrency(mockDonationHistory[0].amount)}
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
                  {mockDonationHistory.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium">
                        {donation.receiptNumber}
                      </TableCell>
                      <TableCell>
                        {formatDate(new Date(donation.date))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{donation.purpose}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(donation.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
              <Heart className="w-4 h-4 mr-2" />
              Create New Receipt
            </Button>
            <Button variant="outline" className="flex-1">
              Edit Donor Information
            </Button>
            <Button variant="outline" className="flex-1">
              View All Receipts
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
