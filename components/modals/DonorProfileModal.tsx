"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Donor } from "@/types";
import {
  Calendar,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
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

  // Calculate donor statistics
  const totalDonations = donorHistory.reduce(
    (total, donation) => total + (donation.amount || 0),
    0
  );
  const averageDonation =
    donorHistory.length > 0 ? totalDonations / donorHistory.length : 0;
  const highestDonation =
    donorHistory.length > 0
      ? Math.max(...donorHistory.map((d) => d.amount))
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[95vh] p-0 bg-white border-0 shadow-2xl rounded-2xl [&>button]:hidden">
        {/* Minimalist Header */}
        <DialogHeader className="relative p-6 pb-0 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                {donor.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-2xl font-semibold text-gray-900">
                  {donor.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {donor.membership} Member
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Joined{" "}
                    {formatDate(new Date(donor.createdAt || "2024-01-01"))}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-8 h-8 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6 overflow-y-auto flex-1">
          {/* Key Metrics - Minimalist Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardContent className="p-4 text-center">
                <Heart className="w-5 h-5 mx-auto mb-2 text-emerald-600" />
                <p className="text-2xl font-bold text-emerald-900">
                  {formatCurrency(totalDonations)}
                </p>
                <p className="text-xs text-emerald-600 uppercase tracking-wide">
                  Total Donated
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-900">
                  {donorHistory.length}
                </p>
                <p className="text-xs text-blue-600 uppercase tracking-wide">
                  Donations
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-2 text-amber-600" />
                <p className="text-2xl font-bold text-amber-900">
                  {formatCurrency(averageDonation)}
                </p>
                <p className="text-xs text-amber-600 uppercase tracking-wide">
                  Average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information - Clean Layout */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">
                      {donor.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">
                      {donor.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:col-span-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">
                      {donor.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donation Summary - Minimalist Design */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Heart className="w-5 h-5 mr-2 text-rose-500" />
                Donation Summary
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100">
                  <p className="text-sm font-medium text-rose-900">
                    Highest Donation
                  </p>
                  <p className="text-xl font-bold text-rose-800">
                    {formatCurrency(highestDonation)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100">
                  <p className="text-sm font-medium text-violet-900">
                    Last Donation
                  </p>
                  <p className="text-xl font-bold text-violet-800">
                    {donorHistory.length > 0
                      ? formatDate(new Date(donorHistory[0].date_of_donation))
                      : "No donations"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Donations - Simplified List */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Recent Donations
              </h3>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">Loading...</span>
                </div>
              ) : donorHistory.length > 0 ? (
                <div className="space-y-3">
                  {donorHistory.slice(0, 5).map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {donation.donation_type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(new Date(donation.date_of_donation))}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(donation.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {donation.payment_mode}
                        </p>
                      </div>
                    </div>
                  ))}
                  {donorHistory.length > 5 && (
                    <div className="pt-2 text-center">
                      <p className="text-xs text-gray-500">
                        +{donorHistory.length - 5} more donations
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    No donation history found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
