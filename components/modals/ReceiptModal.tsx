"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Receipt } from "@/types";
import { CreditCard, Download, Heart, Mail, Printer, User } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface ReceiptModalProps {
  receipt: Receipt;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({
  receipt,
  isOpen,
  onClose,
}: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt-${receipt.receiptNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 2cm;
      }
      @media print {
        body { font-size: 12pt; }
        .no-print { display: none !important; }
      }
    `,
  });

  const handleEmailReceipt = () => {
    // Mock email functionality
    console.log("Sending email receipt for:", receipt.receiptNumber);
    alert("Email sent successfully!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="no-print">
          <DialogTitle>Receipt Details</DialogTitle>
          <DialogDescription>
            View and manage receipt #{receipt.receiptNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mb-6 no-print">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEmailReceipt}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Receipt Content */}
        <div ref={printRef} className="bg-white">
          {/* Header */}
          <div className="text-center mb-8 border-b pb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Heart className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                Ashram Management
              </h1>
            </div>
            <p className="text-gray-600">Donation Receipt</p>
            <p className="text-sm text-gray-500 mt-2">
              123 Temple Street, Sacred City, India - 123456
            </p>
            <p className="text-sm text-gray-500">
              Phone: +91 98765 43210 | Email: admin@ashram.org
            </p>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receipt Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt Number:</span>
                  <span className="font-medium">{receipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Issue:</span>
                  <span className="font-medium">
                    {formatDate(receipt.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Donation:</span>
                  <span className="font-medium">
                    {receipt.dateOfDonation
                      ? formatDate(receipt.dateOfDonation)
                      : "Unknown date"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issued By:</span>
                  <span className="font-medium">{receipt.createdBy}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Donor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <User className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">{receipt.donorName}</p>
                    <p className="text-sm text-gray-500">
                      Donor ID: {receipt.donorId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Donation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Donation Type
                  </label>
                  <p className="text-lg font-semibold mt-1">
                    {receipt.donationType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Payment Mode
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-lg font-semibold">
                      {receipt.paymentMode}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Amount
                  </label>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(receipt.amount || 0)}
                  </p>
                </div>
              </div>

              {receipt.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Notes
                    </label>
                    <p className="mt-1 text-gray-700">{receipt.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Amount in Words */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Amount in Words</p>
                <p className="text-lg font-medium text-gray-900">
                  {/* This would typically be generated by a number-to-words library */}
                  {(receipt.amount || 0) < 1000
                    ? "Less than One Thousand"
                    : "Amount in Words"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="border-t pt-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Tax Information
                </h4>
                <p className="text-sm text-gray-600">
                  This donation is eligible for tax deduction under Section 80G
                  of the Income Tax Act.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  PAN: AAAAT1234C | Registration: 12345678901234567
                </p>
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Authorized Signature</p>
                  <div className="h-16 border-b border-gray-300 mt-2"></div>
                  <p className="text-sm text-gray-600 mt-1">
                    Ashram Administrator
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Thank you for your generous contribution to our sacred mission.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Generated on {formatDateTime(new Date())} | This is a
                computer-generated receipt.
              </p>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg no-print">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  receipt.isPrinted ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {receipt.isPrinted ? "Printed" : "Not Printed"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  receipt.isEmailSent ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {receipt.isEmailSent ? "Emailed" : "Not Emailed"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
