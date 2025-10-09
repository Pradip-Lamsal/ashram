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
import { getDonationTypeLabel } from "@/lib/donation-labels";
import { formatDonationPeriod } from "@/lib/nepali-date-utils";
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
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-0 bg-white border-0 shadow-2xl rounded-2xl [&>button]:hidden mx-auto sm:w-[90vw] md:w-[85vw] lg:w-[80vw]">
        {/* Minimalist Header */}
        <DialogHeader className="relative p-3 pb-0 flex-shrink-0 sm:p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 text-base font-bold text-white rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 sm:w-12 sm:h-12 sm:text-lg md:w-16 md:h-16 md:text-2xl">
                {donor.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-gray-900 sm:text-lg md:text-2xl">
                  {donor.name}
                </DialogTitle>
                <div className="flex flex-col gap-1 mt-1 sm:flex-row sm:items-center sm:gap-2">
                  <Badge variant="outline" className="text-xs w-fit">
                    {donor.membership} Member
                  </Badge>
                  <span className="text-xs text-gray-500 sm:text-sm">
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
              className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-3 pb-3 space-y-3 overflow-y-auto flex-1 sm:px-4 sm:pb-4 sm:space-y-4 md:px-6 md:pb-6 md:space-y-6">
          {/* Key Metrics - Responsive Grid */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardContent className="p-2.5 text-center sm:p-3 md:p-4">
                <Heart className="w-4 h-4 mx-auto mb-1.5 text-emerald-600 sm:w-5 sm:h-5 sm:mb-2" />
                <p className="text-base font-bold text-emerald-900 sm:text-lg md:text-2xl">
                  {formatCurrency(totalDonations)}
                </p>
                <p className="text-xs text-emerald-600 uppercase tracking-wide">
                  Total Donated
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-2.5 text-center sm:p-3 md:p-4">
                <Calendar className="w-4 h-4 mx-auto mb-1.5 text-blue-600 sm:w-5 sm:h-5 sm:mb-2" />
                <p className="text-base font-bold text-blue-900 sm:text-lg md:text-2xl">
                  {donorHistory.length}
                </p>
                <p className="text-xs text-blue-600 uppercase tracking-wide">
                  Donations
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
              <CardContent className="p-2.5 text-center sm:p-3 md:p-4">
                <TrendingUp className="w-4 h-4 mx-auto mb-1.5 text-amber-600 sm:w-5 sm:h-5 sm:mb-2" />
                <p className="text-base font-bold text-amber-900 sm:text-lg md:text-2xl">
                  {formatCurrency(averageDonation)}
                </p>
                <p className="text-xs text-amber-600 uppercase tracking-wide">
                  Average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information - Responsive Layout */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <h3 className="flex items-center mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base md:mb-4 md:text-lg">
                <User className="w-4 h-4 mr-2 text-gray-600 sm:w-5 sm:h-5" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:gap-4">
                <div className="flex items-center space-x-2.5 sm:space-x-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 sm:w-8 sm:h-8">
                    <Phone className="w-3.5 h-3.5 text-gray-600 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 sm:text-sm">
                      Phone
                    </p>
                    <p className="text-xs text-gray-600 sm:text-sm">
                      {donor.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 sm:space-x-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 sm:w-8 sm:h-8">
                    <Mail className="w-3.5 h-3.5 text-gray-600 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 sm:text-sm">
                      Email
                    </p>
                    <p className="text-xs text-gray-600 break-all sm:text-sm">
                      {donor.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 sm:col-span-2 sm:space-x-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 sm:w-8 sm:h-8">
                    <MapPin className="w-3.5 h-3.5 text-gray-600 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 sm:text-sm">
                      Address
                    </p>
                    <p className="text-xs text-gray-600 sm:text-sm">
                      {donor.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donation Summary - Mobile-First Design */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <h3 className="flex items-center mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base md:mb-4 md:text-lg">
                <Heart className="w-4 h-4 mr-2 text-rose-500 sm:w-5 sm:h-5" />
                Donation Summary
              </h3>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:gap-4 md:mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 sm:p-3 md:p-4">
                  <p className="text-xs font-medium text-rose-900 sm:text-sm">
                    Highest Donation
                  </p>
                  <p className="text-base font-bold text-rose-800 sm:text-lg md:text-xl">
                    {formatCurrency(highestDonation)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 sm:p-3 md:p-4">
                  <p className="text-xs font-medium text-violet-900 sm:text-sm">
                    Last Donation
                  </p>
                  <p className="text-base font-bold text-violet-800 sm:text-lg md:text-xl">
                    {donorHistory.length > 0
                      ? formatDate(new Date(donorHistory[0].date_of_donation))
                      : "No donations"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Donations - Mobile Optimized */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base md:mb-4 md:text-lg">
                Recent Donations
              </h3>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-4 sm:py-6 md:py-8">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400 sm:w-5 sm:h-5" />
                  <span className="ml-2 text-xs text-gray-500 sm:text-sm">
                    Loading...
                  </span>
                </div>
              ) : donorHistory.length > 0 ? (
                <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  {donorHistory.slice(0, 5).map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between py-1.5 sm:py-2 md:py-3"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 sm:w-2 sm:h-2"></div>
                        <div>
                          <p className="text-xs font-medium text-gray-900 sm:text-sm">
                            {getDonationTypeLabel(donation.donation_type)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(new Date(donation.date_of_donation))}
                          </p>
                          {formatDonationPeriod(donation) && (
                            <p className="text-xs text-emerald-600 font-medium">
                              {formatDonationPeriod(donation)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-900 sm:text-sm">
                          {formatCurrency(donation.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {donation.payment_mode}
                        </p>
                      </div>
                    </div>
                  ))}
                  {donorHistory.length > 5 && (
                    <div className="pt-1.5 text-center sm:pt-2">
                      <p className="text-xs text-gray-500">
                        +{donorHistory.length - 5} more donations
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center sm:py-6 md:py-8">
                  <Heart className="w-5 h-5 mx-auto mb-1.5 text-gray-300 sm:w-6 sm:h-6 sm:mb-2 md:w-8 md:h-8" />
                  <p className="text-xs text-gray-500 sm:text-sm">
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
