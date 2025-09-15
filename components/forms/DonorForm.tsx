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
import { DonationType, Donor, MembershipType } from "@/types";
import React, { useState } from "react";

const donationTypes: DonationType[] = [
  "General Donation",
  "Seva Donation",
  "Annadanam",
  "Vastra Danam",
  "Building Fund",
  "Festival Sponsorship",
  "Puja Sponsorship",
];

const membershipTypes: MembershipType[] = ["Regular", "Life", "Special"];

interface DonorFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  dateOfBirth: string;
  donationType: DonationType;
  membership: MembershipType;
  notes: string;
}

interface DonorFormError {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  donationType?: string;
  membership?: string;
  notes?: string;
}

interface DonorFormProps {
  onSubmit: (data: DonorFormData) => void;
  onCancel: () => void;
  initialData?: Partial<Donor>;
}

export default function DonorForm({
  onSubmit,
  onCancel,
  initialData,
}: DonorFormProps) {
  const [formData, setFormData] = useState<DonorFormData>({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    dateOfBirth: initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
      : "",
    donationType: initialData?.donationType || "General Donation",
    membership: initialData?.membership || "Regular",
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState<Partial<DonorFormError>>({});

  const validateForm = () => {
    const newErrors: Partial<DonorFormError> = {};

    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s+/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit Indian phone number";
    }

    if (!formData.donationType) {
      newErrors.donationType = "Please select a donation type";
    }

    if (!formData.membership) {
      newErrors.membership = "Please select a membership type";
    }

    // Optional but validated fields
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      } else if (age > 120) {
        newErrors.dateOfBirth = "Please enter a valid date of birth";
      }
    }

    if (
      formData.address &&
      formData.address.trim().length > 0 &&
      formData.address.trim().length < 10
    ) {
      newErrors.address =
        "Address should be at least 10 characters if provided";
    }

    if (formData.notes && formData.notes.trim().length > 500) {
      newErrors.notes = "Notes should not exceed 500 characters";
    }

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
    field: keyof DonorFormData,
    value: string | DonationType | MembershipType
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof DonorFormError]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "");
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    // Format as XXX XXX XXXX
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(
        6
      )}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    }
    return limited;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="mb-2 font-medium text-blue-900">Form Requirements</h4>
          <p className="text-sm text-blue-700">
            <span className="text-red-500">*</span> Required fields: Full Name,
            Phone Number, Donation Type, and Membership Type
          </p>
          <p className="mt-1 text-xs text-blue-600">
            Email and address are optional but recommended for communication and
            receipts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    handleInputChange("phone", formatted);
                  }}
                  placeholder="XXX XXX XXXX"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address (optional)"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                  max={new Date().toISOString().split("T")[0]} // Prevent future dates
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter complete address (optional)"
                className={`min-h-[80px] ${
                  errors.address ? "border-red-500" : ""
                }`}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
              <p className="text-xs text-gray-500">
                Providing an address helps us send donation receipts and updates
              </p>
            </div>
          </div>

          {/* Donation Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Donation Preferences
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="donationType">Preferred Donation Type *</Label>
                <Select
                  value={formData.donationType}
                  onValueChange={(value: DonationType) =>
                    handleInputChange("donationType", value)
                  }
                >
                  <SelectTrigger
                    className={errors.donationType ? "border-red-500" : ""}
                  >
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
                {errors.donationType && (
                  <p className="text-sm text-red-500">{errors.donationType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership">Membership Type *</Label>
                <Select
                  value={formData.membership}
                  onValueChange={(value: MembershipType) =>
                    handleInputChange("membership", value)
                  }
                >
                  <SelectTrigger
                    className={errors.membership ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.membership && (
                  <p className="text-sm text-red-500">{errors.membership}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional information or special notes... (optional)"
              className={`min-h-[80px] ${errors.notes ? "border-red-500" : ""}`}
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes}</p>
              )}
              <p className="ml-auto text-xs text-gray-500">
                {formData.notes.length}/500 characters
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-4 space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              {initialData ? "Update Donor" : "Add Donor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
