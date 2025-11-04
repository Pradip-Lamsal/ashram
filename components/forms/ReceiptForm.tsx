"use client";

import QRModal from "@/components/modals/QRModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NepaliDatePicker } from "@/components/ui/nepali-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DonationType, Donor, PaymentMode } from "@/types";
import { Search } from "lucide-react";
import React, { useMemo, useState } from "react";

interface ReceiptFormData {
  donorId: string;
  donorName: string;
  donationType: DonationType;
  amount: number;
  paymentMode: PaymentMode;
  dateOfDonation: Date;
  notes: string;
  startDate?: Date | null;
  endDate?: Date | null;
  startDateNepali?: string; // Store Nepali date string for display
  endDateNepali?: string; // Store Nepali date string for display
}

interface ReceiptFormError {
  donorId?: string;
  donorName?: string;
  donationType?: string;
  amount?: string;
  paymentMode?: string;
  dateOfDonation?: string;
  notes?: string;
}

interface ReceiptFormProps {
  donors: Donor[];
  onSubmit: (data: ReceiptFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ReceiptFormData>;
}

const donationTypes: DonationType[] = [
  "General Donation",
  "Seva Donation",
  "Annadanam",
  "Vastra Danam",
  "Building Fund",
  "Festival Sponsorship",
  "Puja Sponsorship",
];

// Nepali labels for UI only — keep backend values unchanged
const DONATION_TYPE_LABELS: Record<string, string> = {
  "General Donation": "अक्षयकोष",
  "Seva Donation": "मुठ्ठी दान",
  Annadanam: "गुरुकुलम",
  "Vastra Danam": "जिन्सी सामग्री",
  "Building Fund": "भण्डारा",
  "Festival Sponsorship": "विशेष पूजा",
  "Puja Sponsorship": "आजीवन सदस्यता",
};

const paymentModes: PaymentMode[] = ["Online", "Offline", "QR Payment"];

const generateReceiptNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const time = String(now.getTime()).slice(-6);
  return `REC-${year}${month}${day}-${time}`;
};

export default function ReceiptForm({
  donors,
  onSubmit,
  onCancel,
  initialData,
}: ReceiptFormProps) {
  const [formData, setFormData] = useState<ReceiptFormData>({
    donorId: initialData?.donorId || "",
    donorName: initialData?.donorName || "",
    donationType: initialData?.donationType || "General Donation",
    amount: initialData?.amount || 0,
    paymentMode: initialData?.paymentMode || "Offline",
    dateOfDonation: initialData?.dateOfDonation || new Date(),
    notes: initialData?.notes || "",
    startDate: initialData?.startDate ?? null,
    endDate: initialData?.endDate ?? null,
    startDateNepali: initialData?.startDateNepali || "",
    endDateNepali: initialData?.endDateNepali || "",
  });

  const [errors, setErrors] = useState<Partial<ReceiptFormError>>({});
  const [showQROption, setShowQROption] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [donorSearchTerm, setDonorSearchTerm] = useState("");

  // Filter donors based on search term
  const filteredDonors = useMemo(() => {
    if (!donorSearchTerm.trim()) return donors;

    const searchLower = donorSearchTerm.toLowerCase();
    return donors.filter(
      (donor) =>
        donor.name.toLowerCase().includes(searchLower) ||
        donor.phone?.toLowerCase().includes(searchLower) ||
        donor.email?.toLowerCase().includes(searchLower)
    );
  }, [donors, donorSearchTerm]);

  const validateForm = () => {
    const newErrors: Partial<ReceiptFormError> = {};

    if (!formData.donorId) newErrors.donorId = "Please select a donor";
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = "Amount must be greater than 0";
    if (!formData.dateOfDonation)
      newErrors.dateOfDonation = "Date of donation is required";

    // require start/end dates for मुठ्ठी दान (Seva Donation)
    if (formData.donationType === "Seva Donation") {
      if (!formData.startDate)
        newErrors.dateOfDonation =
          "Start date is required for this donation type";
      if (!formData.endDate)
        newErrors.dateOfDonation =
          "End date is required for this donation type";
      if (
        formData.startDate &&
        formData.endDate &&
        formData.startDate > formData.endDate
      ) {
        newErrors.dateOfDonation =
          "Start date must be before or equal to end date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form data being submitted:", formData);
      console.log("Nepali dates:", {
        startDateNepali: formData.startDateNepali,
        endDateNepali: formData.endDateNepali,
      });
      onSubmit(formData);
    }
  };

  const handleInputChange = (
    field: keyof ReceiptFormData,
    value: string | number | Date | null // allow null for date inputs
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ReceiptFormError]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDonorChange = (donorId: string) => {
    const selectedDonor = donors.find((d) => d.id === donorId);
    if (selectedDonor) {
      setFormData((prev) => ({
        ...prev,
        donorId,
        donorName: selectedDonor.name,
        donationType: selectedDonor.donationType,
      }));
    }
  };

  const handlePaymentModeChange = (mode: PaymentMode) => {
    setFormData((prev) => ({ ...prev, paymentMode: mode }));
    setShowQROption(mode === "QR Payment");
    // Automatically show QR modal when QR Payment is selected
    if (mode === "QR Payment") {
      setShowQRModal(true);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Receipt Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input
                  id="receiptNumber"
                  value={generateReceiptNumber()}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Auto-generated</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfDonation">
                  Date of Donation (नेपाली मिति) *
                </Label>
                <NepaliDatePicker
                  value=""
                  onChange={(dateString: string, adDate?: Date) => {
                    // Convert Nepali date to English date for storage
                    if (adDate) {
                      handleInputChange("dateOfDonation", adDate);
                    } else {
                      // Fallback - use current date
                      handleInputChange("dateOfDonation", new Date());
                    }
                  }}
                  error={!!errors.dateOfDonation}
                />
                {errors.dateOfDonation && (
                  <p className="text-sm text-red-500">
                    {errors.dateOfDonation}
                  </p>
                )}
              </div>
            </div>

            {/* Donor Selection */}
            <div className="space-y-3">
              <Label htmlFor="donor">Select Donor *</Label>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={donorSearchTerm}
                  onChange={(e) => setDonorSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={formData.donorId}
                onValueChange={handleDonorChange}
              >
                <SelectTrigger
                  className={errors.donorId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Choose a donor from the database" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {filteredDonors.length > 0 ? (
                    filteredDonors.map((donor) => (
                      <SelectItem key={donor.id} value={donor.id}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{donor.name}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {donor.phone && <span>📞 {donor.phone}</span>}
                            {donor.email && <span>✉️ {donor.email}</span>}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-center text-gray-500">
                      {donorSearchTerm
                        ? "No donors found matching your search"
                        : "No donors available"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.donorId && (
                <p className="text-sm text-red-500">{errors.donorId}</p>
              )}
            </div>

            {/* Donation Details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="donationType">Donation Type *</Label>
                <Select
                  value={formData.donationType}
                  onValueChange={(value: DonationType) =>
                    handleInputChange("donationType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select donation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {donationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {DONATION_TYPE_LABELS[type] ?? type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (रु) *</Label>
                <Input
                  id="amount"
                  type="text"
                  value={formData.amount || ""}
                  onChange={(e) => {
                    // Only allow numeric input
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleInputChange("amount", value ? Number(value) : 0);
                  }}
                  onKeyDown={(e) => {
                    // Allow: backspace, delete, tab, escape, enter, and navigation keys
                    if (
                      [8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode) ||
                      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode))
                    ) {
                      return;
                    }
                    // Prevent if not a number
                    if (
                      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                      (e.keyCode < 96 || e.keyCode > 105)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="Enter donation amount"
                  className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount}</p>
                )}
              </div>
            </div>

            {/* Payment Mode */}
            <div className="space-y-2">
              <Label htmlFor="paymentMode">Payment Mode *</Label>
              <Select
                value={formData.paymentMode}
                onValueChange={handlePaymentModeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* QR Payment Option */}
            {showQROption && (
              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-center mb-2 space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="font-medium text-orange-800">
                    QR Payment Selected
                  </span>
                </div>
                <p className="text-sm text-orange-700">
                  QR payment code is displayed. The donor can scan the QR code
                  to make the payment.
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information about this donation..."
                className="min-h-[80px]"
              />
            </div>

            {/* Conditional date range for Seva Donation (मुठ्ठी दान) */}
            {formData.donationType === "Seva Donation" && (
              <div className="space-y-2">
                <Label>Donation Period (नेपाली मिति - Start / End)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">
                      Start Date (नेपाली मिति)
                    </label>
                    <NepaliDatePicker
                      value={formData.startDateNepali || ""}
                      onChange={(
                        nepaliDateString: string,
                        approximateEnglishDate?: Date
                      ) => {
                        console.log("Start date picker changed:", {
                          nepaliDateString,
                          approximateEnglishDate,
                        });
                        // Store both Nepali string and English date
                        setFormData((prev) => ({
                          ...prev,
                          startDateNepali: nepaliDateString,
                          startDate: approximateEnglishDate || null,
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">
                      End Date (नेपाली मिति)
                    </label>
                    <NepaliDatePicker
                      value={formData.endDateNepali || ""}
                      onChange={(
                        nepaliDateString: string,
                        approximateEnglishDate?: Date
                      ) => {
                        console.log("End date picker changed:", {
                          nepaliDateString,
                          approximateEnglishDate,
                        });
                        // Store both Nepali string and English date
                        setFormData((prev) => ({
                          ...prev,
                          endDateNepali: nepaliDateString,
                          endDate: approximateEnglishDate || null,
                        }));
                      }}
                    />
                  </div>
                </div>
                {errors.dateOfDonation && (
                  <p className="text-sm text-red-500">
                    {errors.dateOfDonation}
                  </p>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:space-x-4 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full bg-orange-600 sm:w-auto hover:bg-orange-700"
              >
                {initialData ? "Update Receipt" : "Create Receipt"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* QR Modal */}
      <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </>
  );
}
