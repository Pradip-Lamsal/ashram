"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { donationTypes, mockDonors, paymentModes } from "@/data/mockData";
import { generateReceiptNumber } from "@/lib/utils";
import { DonationType, PaymentMode } from "@/types";
import React, { useState } from "react";

interface ReceiptFormData {
  donorId: string;
  donorName: string;
  donationType: DonationType;
  amount: number;
  paymentMode: PaymentMode;
  dateOfDonation: string;
  notes: string;
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
  onSubmit: (data: ReceiptFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ReceiptFormData>;
}

export default function ReceiptForm({
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
    dateOfDonation:
      initialData?.dateOfDonation || new Date().toISOString().split("T")[0],
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState<Partial<ReceiptFormError>>({});
  const [showQROption, setShowQROption] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<ReceiptFormError> = {};

    if (!formData.donorId) newErrors.donorId = "Please select a donor";
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = "Amount must be greater than 0";
    if (!formData.dateOfDonation)
      newErrors.dateOfDonation = "Date of donation is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (
    field: keyof ReceiptFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ReceiptFormError]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDonorChange = (donorId: string) => {
    const selectedDonor = mockDonors.find((d) => d.id === donorId);
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
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Receipt Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="dateOfDonation">Date of Donation *</Label>
              <Input
                id="dateOfDonation"
                type="date"
                value={formData.dateOfDonation}
                onChange={(e) =>
                  handleInputChange("dateOfDonation", e.target.value)
                }
                className={errors.dateOfDonation ? "border-red-500" : ""}
              />
              {errors.dateOfDonation && (
                <p className="text-sm text-red-500">{errors.dateOfDonation}</p>
              )}
            </div>
          </div>

          {/* Donor Selection */}
          <div className="space-y-2">
            <Label htmlFor="donor">Select Donor *</Label>
            <Select value={formData.donorId} onValueChange={handleDonorChange}>
              <SelectTrigger className={errors.donorId ? "border-red-500" : ""}>
                <SelectValue placeholder="Choose a donor from the database" />
              </SelectTrigger>
              <SelectContent>
                {mockDonors.map((donor) => (
                  <SelectItem key={donor.id} value={donor.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{donor.name}</span>
                      <span className="text-sm text-gray-500">
                        {donor.phone}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.donorId && (
              <p className="text-sm text-red-500">{errors.donorId}</p>
            )}
          </div>

          {/* Donation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={formData.amount || ""}
                onChange={(e) =>
                  handleInputChange("amount", Number(e.target.value))
                }
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
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="font-medium text-orange-800">
                  QR Payment Selected
                </span>
              </div>
              <p className="text-sm text-orange-700">
                A QR code will be generated for this receipt. The donor can use
                this to make the payment.
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

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              {initialData ? "Update Receipt" : "Create Receipt"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
