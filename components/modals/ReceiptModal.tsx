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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Receipt } from "@/types";
import {
  CreditCard,
  Download,
  Heart,
  History,
  Loader2,
  Mail,
  Printer,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

interface ReceiptModalProps {
  receipt: Receipt;
  isOpen: boolean;
  onClose: () => void;
  donorHistory?: Array<{
    id: string;
    amount: number;
    donation_type: string;
    payment_mode: string;
    date_of_donation: string;
    notes?: string;
  }>;
  loadingHistory?: boolean;
  onMarkPrinted?: (receiptId: string) => void;
  onDeleteReceipt?: (receiptId: string) => void;
  onUpdateReceipt?: (receiptId: string) => void;
  isUpdating?: boolean;
}

export default function ReceiptModal({
  receipt,
  isOpen,
  onClose,
  donorHistory = [],
  loadingHistory = false,
  onMarkPrinted,
  onDeleteReceipt,
  isUpdating = false,
}: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Consolidated email state to reduce useState calls and improve performance
  const [emailState, setEmailState] = useState({
    isDialogOpen: false,
    address: "",
    isSending: false,
    error: "",
  });

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Simple toast function
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500); // Hide after 1.5 seconds
  };

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

  const handleEmailReceipt = useCallback(() => {
    // Open email dialog to get email address
    setEmailState({
      isDialogOpen: true,
      address: "",
      isSending: false,
      error: "",
    });
  }, []);

  const handleSendEmail = useCallback(async () => {
    // Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailState.address.trim()) {
      setEmailState((prev) => ({
        ...prev,
        error: "Email address is required",
      }));
      return;
    }
    if (!emailRegex.test(emailState.address)) {
      setEmailState((prev) => ({
        ...prev,
        error: "Please enter a valid email address",
      }));
      return;
    }

    setEmailState((prev) => ({ ...prev, isSending: true, error: "" }));

    try {
      const response = await fetch("/api/send-receipt-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorEmail: emailState.address,
          receipt: {
            receiptNumber: receipt.receiptNumber,
            donorName: receipt.donorName,
            amount: receipt.amount,
            createdAt: receipt.createdAt,
            donationType: receipt.donationType,
            paymentMode: receipt.paymentMode,
            dateOfDonation: receipt.dateOfDonation,
            notes: receipt.notes,
          },
          includeAttachment: false, // For now, just send email without PDF
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Close dialog and show success message
        setEmailState({
          isDialogOpen: false,
          address: "",
          isSending: false,
          error: "",
        });
        showToastNotification("Email sent successfully");
        // TODO: Update receipt status to mark as emailed
      } else {
        setEmailState((prev) => ({
          ...prev,
          isSending: false,
          error: result.error || "Failed to send email. Please try again.",
        }));
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setEmailState((prev) => ({
        ...prev,
        isSending: false,
        error: "Network error. Please check your connection and try again.",
      }));
    }
  }, [emailState.address, receipt]);

  const handleDownloadPDF = () => {
    // Generate supermarket-style receipt that matches the print design
    const htmlContent = `
      <html>
        <head>
          <title>Receipt ${receipt.receiptNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 1cm;
            }
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
              background: white;
              color: black;
            }
            .receipt-container {
              border: 2px dashed #333;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              margin-bottom: 15px;
            }
            .org-name {
              font-size: 18px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 5px;
            }
            .receipt-title {
              font-size: 14px;
              margin-bottom: 10px;
            }
            .receipt-number {
              font-size: 16px;
              font-weight: bold;
              background: #f0f0f0;
              padding: 5px;
              border: 1px solid #333;
            }
            .section {
              margin: 15px 0;
              border-bottom: 1px dotted #666;
              padding-bottom: 10px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 12px;
            }
            .label {
              font-weight: normal;
              text-transform: uppercase;
            }
            .value {
              font-weight: bold;
              text-align: right;
            }
            .amount-section {
              background: #f9f9f9;
              border: 2px solid #333;
              padding: 15px;
              margin: 15px 0;
              text-align: center;
            }
            .amount-label {
              font-size: 12px;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .amount-value {
              font-size: 24px;
              font-weight: bold;
              font-family: 'Arial', sans-serif;
            }
            .amount-words {
              font-size: 10px;
              margin-top: 10px;
              text-transform: uppercase;
              border-top: 1px solid #333;
              padding-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 2px solid #333;
              padding-top: 15px;
            }
            .thank-you {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .timestamp {
              font-size: 10px;
              color: #666;
            }
            .divider {
              text-align: center;
              margin: 10px 0;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <!-- Header -->
            <div class="header">
              <div class="org-name">🏛️ ASHRAM</div>
              <div class="receipt-title">DONATION RECEIPT</div>
              <div class="receipt-number">#${receipt.receiptNumber}</div>
            </div>

            <!-- Date & Time -->
            <div class="section">
              <div class="row">
                <span class="label">Date:</span>
                <span class="value">${formatDate(receipt.createdAt)}</span>
              </div>
              <div class="row">
                <span class="label">Time:</span>
                <span class="value">${new Date(
                  receipt.createdAt
                ).toLocaleTimeString()}</span>
              </div>
            </div>

            <!-- Donor Details -->
            <div class="section">
              <div class="divider">--- DONOR INFORMATION ---</div>
              <div class="row">
                <span class="label">Name:</span>
                <span class="value">${receipt.donorName}</span>
              </div>
              <div class="row">
                <span class="label">Donor ID:</span>
                <span class="value">${receipt.donorId}</span>
              </div>
            </div>

            <!-- Transaction Details -->
            <div class="section">
              <div class="divider">--- TRANSACTION DETAILS ---</div>
              <div class="row">
                <span class="label">Type:</span>
                <span class="value">${receipt.donationType}</span>
              </div>
              <div class="row">
                <span class="label">Payment:</span>
                <span class="value">${receipt.paymentMode}</span>
              </div>
              <div class="row">
                <span class="label">Donation Date:</span>
                <span class="value">${
                  receipt.dateOfDonation
                    ? formatDate(receipt.dateOfDonation)
                    : "N/A"
                }</span>
              </div>
            </div>

            <!-- Amount Section -->
            <div class="amount-section">
              <div class="amount-label">TOTAL AMOUNT</div>
              <div class="amount-value">₹${
                receipt.amount?.toLocaleString("en-IN") || "0"
              }</div>
              <div class="amount-words">
                ${
                  receipt.amount
                    ? `Rupees ${receipt.amount.toLocaleString("en-IN")} Only`
                    : "Amount not specified"
                }
              </div>
            </div>

            ${
              receipt.notes
                ? `
            <!-- Notes -->
            <div class="section">
              <div class="divider">--- NOTES ---</div>
              <div style="font-size: 11px; text-align: center; font-style: italic;">
                "${receipt.notes}"
              </div>
            </div>
            `
                : ""
            }

            <!-- Footer -->
            <div class="footer">
              <div class="thank-you">🙏 THANK YOU FOR YOUR DONATION! 🙏</div>
              <div style="font-size: 10px; margin: 10px 0;">
                Your contribution helps us serve the community
              </div>
              <div class="divider">--- KEEP THIS RECEIPT FOR YOUR RECORDS ---</div>
              <div class="timestamp">
                Generated: ${new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create and download the receipt
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt-${receipt.receiptNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also open for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  // Calculate donor totals from history - memoized to prevent recalculation on every render
  const { totalDonations, donationCount } = useMemo(() => {
    const total = donorHistory.reduce(
      (sum, donation) => sum + (donation.amount || 0),
      0
    );
    return {
      totalDonations: total,
      donationCount: donorHistory.length,
    };
  }, [donorHistory]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader className="no-print">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Receipt #{receipt.receiptNumber}</DialogTitle>
                <DialogDescription>
                  Donor: {receipt.donorName} | Amount:{" "}
                  {formatCurrency(receipt.amount || 0)}
                </DialogDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="receipt" className="w-full">
            <TabsList className="grid w-full grid-cols-2 no-print">
              <TabsTrigger value="receipt">Receipt Details</TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-2" />
                Donor History ({donationCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="receipt" className="space-y-6">
              {/* Enhanced Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4 no-print">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="flex items-center justify-center h-12 hover:bg-orange-50 hover:border-orange-200"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEmailReceipt}
                  className="flex items-center justify-center h-12 hover:bg-blue-50 hover:border-blue-200"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center h-12 hover:bg-green-50 hover:border-green-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>{" "}
                <Button
                  variant="outline"
                  onClick={() => onMarkPrinted?.(receipt.id)}
                  disabled={receipt.isPrinted || isUpdating}
                  className="flex items-center justify-center h-12 hover:bg-purple-50 hover:border-purple-200 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Printer className="w-4 h-4 mr-2" />
                  )}
                  {receipt.isPrinted ? "Already Printed" : "Mark as Printed"}
                </Button>
              </div>

              {/* Danger Zone - Delete Action */}
              <div className="p-4 mb-6 border border-red-200 rounded-lg no-print bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-red-900">
                      Danger Zone
                    </h4>
                    <p className="text-sm text-red-700">
                      Permanently delete this receipt. This action cannot be
                      undone.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to delete this receipt? This action cannot be undone."
                        )
                      ) {
                        onDeleteReceipt?.(receipt.id);
                        onClose();
                      }
                    }}
                    disabled={isUpdating}
                    className="text-red-600 border-red-300 hover:text-red-700 hover:border-red-300"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete Receipt
                  </Button>
                </div>
              </div>

              {/* Enhanced Receipt Content for Printing */}
              <div
                ref={printRef}
                className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {/* Professional Header */}
                <div className="pb-6 mb-8 text-center border-b-2 border-orange-500">
                  <div className="flex items-center justify-center mb-4 space-x-3">
                    <Heart className="w-10 h-10 text-orange-500" />
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900">
                        Ashram Donation Receipt
                      </h1>
                      <p className="text-lg font-medium text-orange-600">
                        Official Receipt
                      </p>
                    </div>
                  </div>
                  <div className="p-3 mt-4 rounded-lg bg-orange-50">
                    <p className="text-xl font-bold text-orange-800">
                      Receipt #{receipt.receiptNumber}
                    </p>
                    <p className="mt-1 text-sm text-orange-600">
                      Issued on {formatDate(receipt.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Two Column Layout for Receipt Details */}
                <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
                  {/* Donor Information */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h3 className="flex items-center mb-3 text-lg font-bold text-gray-900">
                        <User className="w-5 h-5 mr-2 text-gray-600" />
                        Donor Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">
                            Name:
                          </span>
                          <span className="font-bold text-gray-900">
                            {receipt.donorName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">
                            Donor ID:
                          </span>
                          <span className="font-mono text-sm">
                            {receipt.donorId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Information */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50">
                      <h3 className="mb-3 text-lg font-bold text-gray-900">
                        Receipt Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">
                            Date of Donation:
                          </span>
                          <span className="font-semibold">
                            {receipt.dateOfDonation
                              ? formatDate(receipt.dateOfDonation)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">
                            Issued By:
                          </span>
                          <span className="font-semibold">
                            {receipt.createdBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Donation Details */}
                <div className="p-6 mb-8 border-2 border-green-200 rounded-lg bg-green-50">
                  <h3 className="mb-6 text-2xl font-bold text-center text-green-800">
                    Donation Information
                  </h3>

                  <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                    <div className="text-center">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <label className="block mb-2 text-sm font-medium text-gray-600">
                          Donation Type
                        </label>
                        <p className="text-lg font-bold text-green-700">
                          {receipt.donationType}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <label className="block mb-2 text-sm font-medium text-gray-600">
                          Payment Mode
                        </label>
                        <div className="flex items-center justify-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-lg font-bold text-blue-700">
                            {receipt.paymentMode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <label className="block mb-2 text-sm font-medium text-gray-600">
                          Amount Donated
                        </label>
                        <p className="text-3xl font-bold text-green-600">
                          {formatCurrency(receipt.amount || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {receipt.notes && (
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <label className="block mb-2 text-sm font-medium text-gray-600">
                        Special Notes
                      </label>
                      <p className="italic text-gray-700">
                        &ldquo;{receipt.notes}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Amount in Words - Enhanced */}
                <div className="p-6 mb-8 border-2 border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="mb-3 text-lg font-bold text-center text-orange-800">
                    Amount in Words
                  </h4>
                  <div className="p-4 bg-white border-2 border-orange-300 border-dashed rounded-lg">
                    <p className="text-xl font-bold text-center text-orange-900">
                      {receipt.amount
                        ? `Rupees ${receipt.amount.toLocaleString(
                            "en-IN"
                          )} Only`
                        : "Amount not specified"}
                    </p>
                  </div>
                </div>

                {/* Professional Footer */}
                <div className="pt-6 mt-8 border-t-2 border-orange-500">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-bold text-gray-900">
                        Important Information:
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>
                          • This receipt is valid for tax deduction purposes
                        </li>
                        <li>• Please preserve this receipt for your records</li>
                        <li>• For any queries, contact our office</li>
                      </ul>
                    </div>
                    <div className="text-right">
                      <div className="pt-4 mt-4 border-t border-gray-300">
                        <p className="text-sm text-gray-600">
                          Authorized Signature
                        </p>
                        <div className="h-12 mb-2 border-b border-gray-300"></div>
                        <p className="text-xs text-gray-500">
                          Receipt generated on {formatDateTime(new Date())}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 text-center border-t border-gray-200">
                    <p className="mb-2 text-lg font-semibold text-orange-700">
                      🙏 Thank you for your generous donation! 🙏
                    </p>
                    <p className="text-sm text-gray-600">
                      Your contribution helps us serve the community better
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="flex items-center justify-between p-4 mt-6 rounded-lg bg-gray-50 no-print">
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
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalDonations)}
                    </p>
                    <p className="text-sm text-gray-600">Total Donated</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {donationCount}
                    </p>
                    <p className="text-sm text-gray-600">Total Donations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {donationCount > 0
                        ? formatCurrency(totalDonations / donationCount)
                        : "₹0"}
                    </p>
                    <p className="text-sm text-gray-600">Average Donation</p>
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
                      <span className="ml-2">Loading history...</span>
                    </div>
                  ) : donorHistory.length > 0 ? (
                    <div className="space-y-3">
                      {donorHistory.map((donation, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">
                              {donation.donation_type}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(new Date(donation.date_of_donation))}
                            </p>
                            {donation.notes && (
                              <p className="mt-1 text-xs text-gray-500">
                                {donation.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(donation.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {donation.payment_mode}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-gray-500">
                      No donation history found for this donor.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog
        open={emailState.isDialogOpen}
        onOpenChange={(open) =>
          setEmailState((prev) => ({ ...prev, isDialogOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Receipt via Email</DialogTitle>
            <DialogDescription>
              Enter the email address where you want to send the receipt for{" "}
              {receipt.donorName}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="donor@example.com"
                value={emailState.address}
                onChange={(e) =>
                  setEmailState((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !emailState.isSending) {
                    handleSendEmail();
                  }
                }}
                disabled={emailState.isSending}
              />
              {emailState.error && (
                <p className="text-sm text-red-600">{emailState.error}</p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800">
                <strong>Receipt Details:</strong>
              </p>
              <p className="text-sm text-blue-700">
                Receipt #{receipt.receiptNumber} | Amount:{" "}
                {formatCurrency(receipt.amount || 0)}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                setEmailState((prev) => ({ ...prev, isDialogOpen: false }))
              }
              disabled={emailState.isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={emailState.isSending || !emailState.address.trim()}
            >
              {emailState.isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Simple Toast Notification */}
      {showToast && (
        <div className="fixed z-50 duration-300 top-4 right-4 animate-in slide-in-from-top-2">
          <div className="max-w-md px-4 py-3 text-green-800 border border-l-4 border-green-200 rounded shadow-lg bg-green-50 border-l-green-500">
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-2 text-green-600" />
              <p className="font-medium">{toastMessage}</p>
              <button
                onClick={() => setShowToast(false)}
                className="ml-4 text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
