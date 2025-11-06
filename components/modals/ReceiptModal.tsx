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
import { formatDonationDate } from "@/lib/nepali-date-utils";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { DonationType, PaymentMode } from "@/types";
import * as lucideReact from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

// add small helper to display fallback humanized english label
function humanizeDonationType(type?: string) {
  if (!type) return "N/A";
  return String(type)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// --- ADDED: safe date helpers (handle string | Date | null) ---
function toDate(d?: string | Date | null): Date | null {
  if (!d) return null;
  return d instanceof Date ? d : new Date(d);
}

function safeFormatDate(d?: string | Date | null) {
  const dt = toDate(d);
  return dt ? formatDate(dt) : "N/A";
}

function safeFormatDateTime(d?: string | Date | null) {
  const dt = toDate(d);
  return dt ? formatDateTime(dt) : formatDateTime(new Date());
}
// --- end added helpers ---

// explicit receipt shape used by this modal (includes optional UI-only fields)
interface ReceiptModalReceipt {
  id: string;
  receiptNumber: string;
  donorName: string;
  donationType: DonationType;
  amount: number;
  paymentMode: PaymentMode | string;
  dateOfDonation?: Date | string | null;
  notes?: string;
  isPrinted: boolean;
  isEmailSent: boolean;
  createdAt: Date | string;
  donationId?: string;
  donorId?: string;
  createdBy?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  startDateNepali?: string; // Original Nepali date string
  endDateNepali?: string; // Original Nepali date string
}

interface ReceiptModalProps {
  receipt: ReceiptModalReceipt;
  isOpen: boolean;
  onClose: () => void;
  donorHistory?: Array<{
    id: string;
    amount: number;
    donation_type: string;
    payment_mode: string;
    date_of_donation: string;
    start_date?: string;
    end_date?: string;
    notes?: string;
  }>;
  loadingHistory?: boolean;
  onMarkPrinted?: (receiptId: string) => void;
  onMarkEmailed?: (receiptId: string) => void;
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
  onMarkEmailed,
  onDeleteReceipt,
  isUpdating = false,
}: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement | null>(null);

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

  // Loading states for actions
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simple toast function
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500); // Hide after 1.5 seconds
  };

  // use an `any` options object and set both `getContent` and `content`
  // to avoid TypeScript errors across react-to-print versions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const printOptions: any = {
    contentRef: printRef,
    documentTitle: `Receipt-${receipt.receiptNumber}`,
    pageStyle: `
      @page { size: A4; margin: 1.5cm; }
      @media print {
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          font-size: 10pt !important; 
          line-height: 1.2 !important; 
          color: black !important; 
          background: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print { display: none !important; }
        .print-page { 
          max-height: none !important; 
          page-break-inside: avoid; 
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }
        .print-section { margin-bottom: 0.8rem !important; }
        .print-header { 
          border-bottom: 2px solid #ea580c; 
          padding-bottom: 0.6rem !important; 
          margin-bottom: 1rem !important; 
        }
        .print-footer { 
          border-top: 2px solid #ea580c; 
          padding-top: 0.8rem !important; 
          margin-top: 1rem !important; 
        }
        
        /* Compact header styles */
        .print-page .header .text-2xl { font-size: 14pt !important; }
        .print-page .header .text-lg { font-size: 12pt !important; }
        .print-page .header .text-base { font-size: 10pt !important; }
        .print-page .header .text-sm { font-size: 9pt !important; }
        .print-page .header .text-xs { font-size: 8pt !important; }
        
        /* Compact content styles */
        .print-page .grid { gap: 0.8rem !important; }
        .print-page .space-y-3 > * + * { margin-top: 0.5rem !important; }
        .print-page .space-y-2 > * + * { margin-top: 0.3rem !important; }
        .print-page .mb-6 { margin-bottom: 1rem !important; }
        .print-page .mb-4 { margin-bottom: 0.8rem !important; }
        .print-page .mb-3 { margin-bottom: 0.6rem !important; }
        .print-page .mb-2 { margin-bottom: 0.4rem !important; }
        .print-page .p-6 { padding: 1rem !important; }
        .print-page .p-4 { padding: 0.8rem !important; }
        .print-page .p-3 { padding: 0.6rem !important; }
        .print-page .py-8 { padding-top: 0.8rem !important; padding-bottom: 0.8rem !important; }
        
        /* Image sizing for print */
        .print-page img { 
          width: 40px !important; 
          height: 40px !important; 
          object-fit: contain !important; 
        }
        
        /* Amount styling */
        .print-amount { font-size: 14pt !important; font-weight: bold !important; }
        
        /* Ensure single page layout */
        .print-page .border-2 { border-width: 1px !important; }
        .print-page .rounded-lg { border-radius: 4px !important; }
      }
    `,
  };

  const handlePrint = useReactToPrint(printOptions);

  const handlePrintWithLoading = useCallback(async () => {
    setIsPrinting(true);
    try {
      await handlePrint();
      showToastNotification("Receipt printed successfully");
      // Mark receipt as printed
      onMarkPrinted?.(receipt.id);
    } catch (error) {
      console.error("Error printing receipt:", error);
      showToastNotification("Failed to print receipt. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  }, [handlePrint, receipt.id, onMarkPrinted]);

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
      const donationTypeDisplay = getDisplayDonationType(
        receipt.donationType as string,
        undefined // Use undefined since donationTypeLabel doesn't exist in the interface
      );
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
            donorId: receipt.donorId,
            amount: receipt.amount,
            createdAt: receipt.createdAt,
            // send friendly label for email, keep raw value if backend needs it
            donationType: donationTypeDisplay,
            donationTypeRaw: receipt.donationType,
            paymentMode: receipt.paymentMode,
            dateOfDonation: receipt.dateOfDonation,
            notes: receipt.notes,
            createdBy: receipt.createdBy,
          },
          includeAttachment: true, // Enable PDF attachment (backend must support)
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
        showToastNotification("Email sent successfully with PDF attachment");
        // Mark receipt as emailed
        onMarkEmailed?.(receipt.id);
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
  }, [emailState.address, receipt, onMarkEmailed]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/download-receipt-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receipt: {
            receiptNumber: receipt.receiptNumber,
            donorName: receipt.donorName,
            donorId: receipt.donorId,
            amount: receipt.amount,
            createdAt: receipt.createdAt,
            donationType: receipt.donationType,
            paymentMode: receipt.paymentMode,
            dateOfDonation: receipt.dateOfDonation,
            startDate: receipt.startDate,
            endDate: receipt.endDate,
            notes: receipt.notes,
            createdBy: receipt.createdBy,
          },
          includeLogos: true, // Include logos for downloaded PDFs
        }),
      });

      if (response.ok) {
        // Download the PDF file
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Receipt-${receipt.receiptNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToastNotification("PDF downloaded successfully");
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showToastNotification("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Calculate donor totals from history - memoized to prevent recalculation on every render
  const { totalDonations, donationCount } = useMemo(() => {
    const total = donorHistory.reduce(
      (sum, donation) =>
        sum +
        (typeof donation.amount === "string"
          ? parseFloat(donation.amount || "0")
          : donation.amount || 0),
      0
    );
    return {
      totalDonations: total,
      donationCount: donorHistory.length,
    };
  }, [donorHistory]);

  // Helper function to format donation date for receipt display
  const formatReceiptDonationDate = () => {
    if (receipt.donationType === "Seva Donation") {
      // If we have Nepali date strings, use them directly (more accurate)
      if (receipt.startDateNepali && receipt.endDateNepali) {
        return `${receipt.startDateNepali} देखि ${receipt.endDateNepali} सम्म`;
      }

      // Fallback to converting English dates to Nepali
      if (receipt.startDate && receipt.endDate) {
        const startNepali = safeFormatDate(receipt.startDate);
        const endNepali = safeFormatDate(receipt.endDate);
        return `${startNepali} देखि ${endNepali} सम्म`;
      }
    }

    // For regular donations, show the donation date
    if (receipt.dateOfDonation) {
      return safeFormatDate(receipt.dateOfDonation);
    }

    return "N/A";
  };

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
                <lucideReact.X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="receipt" className="w-full">
            <TabsList className="grid w-full grid-cols-2 no-print">
              <TabsTrigger value="receipt">Receipt Details</TabsTrigger>
              <TabsTrigger value="history">
                <lucideReact.History className="w-4 h-4 mr-2" />
                Donor History ({donationCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="receipt" className="space-y-6">
              {/* Enhanced Action Buttons with Orange Theme */}
              <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4 no-print">
                <Button
                  onClick={handlePrintWithLoading}
                  disabled={isPrinting}
                  className="flex items-center justify-center h-12 font-medium text-white transition-all duration-200 bg-orange-600 shadow-sm hover:bg-orange-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPrinting ? (
                    <lucideReact.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <lucideReact.Printer className="w-4 h-4 mr-2" />
                  )}
                  {isPrinting ? "Printing..." : "Print Receipt"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEmailReceipt}
                  className="flex items-center justify-center h-12 font-medium text-orange-700 transition-all duration-200 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                >
                  <lucideReact.Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex items-center justify-center h-12 font-medium text-orange-700 transition-all duration-200 border-orange-200 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <lucideReact.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <lucideReact.Download className="w-4 h-4 mr-2" />
                  )}
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkPrinted?.(receipt.id);
                  }}
                  disabled={receipt.isPrinted || isUpdating}
                  className="flex items-center justify-center h-12 font-medium text-orange-700 transition-all duration-200 border-orange-200 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <lucideReact.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : receipt.isPrinted ? (
                    <lucideReact.Check className="w-4 h-4 mr-2" />
                  ) : (
                    <lucideReact.Printer className="w-4 h-4 mr-2" />
                  )}
                  {receipt.isPrinted ? "Printed" : "Mark Printed"}
                </Button>
              </div>

              {/* Improved Danger Zone */}
              <div className="p-4 mb-6 border border-red-200 rounded-lg no-print bg-red-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="mb-1 text-sm font-semibold text-red-900">
                      Danger Zone
                    </h4>
                    <p className="text-sm text-red-700">
                      Delete this receipt. This action can be undone by an
                      administrator.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    disabled={isUpdating}
                    className="ml-4 text-red-600 transition-colors duration-200 border-red-300 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                  >
                    {isUpdating ? (
                      <lucideReact.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <lucideReact.Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete Receipt
                  </Button>
                </div>
              </div>

              {/* Enhanced Receipt Content for Printing */}
              <div
                ref={printRef}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm print-page"
              >
                {/* Compact Professional Header with Orange Theme */}
                <div className="pb-3 mb-4 text-center border-b-2 border-orange-500 print-header">
                  {/* Header with Logos */}
                  <div className="flex items-start justify-between mb-3">
                    {/* Left Logo with Registration Numbers */}
                    <div className="flex-shrink-0">
                      <div className="mb-1 text-xs text-center text-gray-600">
                        <p>जि.प्र.का.ल.पु.द.नं. ४५४५/०६८</p>
                        <p>पान नं ६००५९५६९०</p>
                      </div>
                      <Image
                        src="/logo11.jpeg"
                        alt="Logo 1"
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </div>

                    {/* Center Content */}
                    <div className="flex-1 mx-4">
                      {/* Sacred Symbol */}
                      <div className="mb-1 text-xl text-orange-600">ॐ</div>

                      {/* Main Organization Header */}
                      <div className="mb-2">
                        <div className="mb-1 text-xs font-bold text-orange-700">
                          श्रीराधासर्वेश्वरो विजयते
                        </div>
                        <h1 className="text-base font-bold leading-tight text-gray-900">
                          श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर
                        </h1>
                        <h2 className="text-xs font-semibold text-gray-800">
                          व्यवस्थापन तथा सञ्चालन समिति
                        </h2>
                        <div className="mt-1 text-xs text-gray-700">
                          <p>ललितपुर म.न.पा.-९, शङ्खमूल, ललितपुर</p>
                          <p>फोन नं. ०१-५९१५६६७</p>
                          <p className="text-blue-600">
                            E-mail: jashankhamul@gmail.com
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Logo with Association Number */}
                    <div className="flex-shrink-0">
                      <div className="mb-1 text-xs text-center text-gray-600">
                        <p>स.क.प.आवद्धता नं. ३५०९१</p>
                      </div>
                      <Image
                        src="/logo22.jpeg"
                        alt="Logo 2"
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Receipt Info */}
                  <div className="inline-block p-2 mt-2 border border-orange-200 rounded-lg bg-orange-50">
                    <p className="text-sm font-bold text-orange-800">
                      Receipt #{receipt.receiptNumber}
                    </p>
                    <p className="mt-1 text-xs text-orange-600">
                      Issued on {safeFormatDate(receipt.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Compact Two Column Layout for Receipt Details */}
                <div className="grid grid-cols-1 gap-3 mb-4 print-section md:grid-cols-2">
                  {/* Donor Information */}
                  <div className="space-y-2">
                    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="flex items-center mb-2 text-sm font-bold text-gray-900">
                        <lucideReact.User className="w-4 h-4 mr-2 text-orange-600" />
                        Donor Information
                      </h3>
                      <div className="space-y-1 text-xs">
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
                          <span className="font-mono text-xs text-gray-700">
                            {receipt.donorId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Information */}
                  <div className="space-y-2">
                    <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                      <h3 className="mb-2 text-sm font-bold text-gray-900">
                        Receipt Details
                      </h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">
                            Donation Date:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatReceiptDonationDate()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">
                            Issued By:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {receipt.createdBy || "System"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Donation Details - Compact Layout */}
                <div className="p-3 mb-4 border-2 border-orange-200 rounded-lg print-section bg-orange-50">
                  <h3 className="mb-3 text-sm font-bold text-center text-orange-800">
                    Donation Information
                  </h3>

                  <div className="grid grid-cols-1 gap-3 mb-3 md:grid-cols-3">
                    <div className="text-center">
                      <div className="p-2 bg-white border border-orange-100 rounded-lg shadow-sm">
                        <label className="block mb-1 text-xs font-medium text-gray-600">
                          Donation Type
                        </label>
                        <p className="text-sm font-bold text-orange-700">
                          {getDisplayDonationType(
                            receipt.donationType as string,
                            undefined // Use undefined since donationTypeLabel doesn't exist in the interface
                          )}
                        </p>
                      </div>
                    </div>

                    {/* show donation period when present */}
                    {receipt.startDate && receipt.endDate && (
                      <div className="text-center">
                        <div className="p-2 bg-white border border-orange-100 rounded-lg shadow-sm">
                          <label className="block mb-1 text-xs font-medium text-gray-600">
                            Donation Period
                          </label>
                          <p className="text-sm font-medium text-emerald-600">
                            {safeFormatDate(receipt.startDate)} देखि{" "}
                            {safeFormatDate(receipt.endDate)} सम्म
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="p-2 bg-white border border-orange-100 rounded-lg shadow-sm">
                        <label className="block mb-1 text-xs font-medium text-gray-600">
                          Payment Mode
                        </label>
                        <div className="flex items-center justify-center space-x-1">
                          <lucideReact.CreditCard className="w-3 h-3 text-gray-500" />
                          <span className="text-sm font-bold text-blue-700">
                            {receipt.paymentMode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="p-2 bg-white border border-orange-100 rounded-lg shadow-sm">
                        <label className="block mb-1 text-xs font-medium text-gray-600">
                          Amount Donated
                        </label>
                        <p className="text-lg font-bold text-orange-600 print-amount">
                          {formatCurrency(receipt.amount || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {receipt.notes && (
                    <div className="p-2 bg-white border border-orange-100 rounded-lg shadow-sm">
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        Special Notes
                      </label>
                      <p className="text-xs italic text-gray-700">
                        &ldquo;{receipt.notes}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Amount in Words - Compact */}
                <div className="p-3 mb-4 border-2 border-orange-200 rounded-lg print-section bg-orange-50">
                  <h4 className="mb-2 text-sm font-bold text-center text-orange-800">
                    Amount in Words
                  </h4>
                  <div className="p-2 bg-white border-2 border-orange-300 border-dashed rounded-lg">
                    <p className="text-sm font-bold text-center text-orange-900">
                      {receipt.amount
                        ? `Rupees ${receipt.amount.toLocaleString(
                            "en-IN"
                          )} Only`
                        : "Amount not specified"}
                    </p>
                  </div>
                </div>

                {/* Compact Footer */}
                <div className="pt-3 mt-4 border-t-2 border-orange-500 print-footer">
                  <div className="text-right">
                    <div className="pt-2 mt-2 border-t border-gray-300">
                      <p className="mb-2 text-xs text-gray-600">
                        Authorized Signature
                      </p>
                      <div className="h-6 mb-1 border-b border-gray-300"></div>
                      <p className="text-xs text-gray-500">
                        Date: {new Date().toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Status Information */}
              <div className="flex items-center justify-between p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50 no-print">
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        receipt.isPrinted ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {receipt.isPrinted ? "Printed" : "Not Printed"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        receipt.isEmailSent ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {receipt.isEmailSent ? "Emailed" : "Not Emailed"}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {safeFormatDateTime(receipt.createdAt)}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                <Card className="border-orange-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(totalDonations)}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      Total Donated
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-orange-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {donationCount}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      Total Donations
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-orange-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {donationCount > 0
                        ? formatCurrency(totalDonations / donationCount)
                        : "रु 0"}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      Average Donation
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg text-gray-900">
                    <lucideReact.History className="w-5 h-5 mr-2 text-orange-600" />
                    Donation History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <lucideReact.Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
                      <span className="ml-2 text-gray-600">
                        Loading history...
                      </span>
                    </div>
                  ) : donorHistory.length > 0 ? (
                    <div className="space-y-3">
                      {donorHistory.map((donation, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 transition-colors duration-200 border border-orange-100 rounded-lg bg-orange-50 hover:bg-orange-100"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {getDisplayDonationType(donation.donation_type)}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <lucideReact.Calendar className="w-3 h-3" />
                              <span>{formatDonationDate(donation)}</span>
                            </div>
                            {donation.notes && (
                              <p className="mt-1 text-xs italic text-gray-500">
                                {donation.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">
                              {formatCurrency(donation.amount)}
                            </p>
                            <div className="flex items-center justify-end space-x-1 text-xs text-gray-500">
                              <lucideReact.CreditCard className="w-3 h-3" />
                              <span>{donation.payment_mode}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <lucideReact.History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">
                        No donation history found for this donor.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Enhanced Email Dialog */}
      <Dialog
        open={emailState.isDialogOpen}
        onOpenChange={(open) =>
          setEmailState((prev) => ({ ...prev, isDialogOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-gray-900">
              <lucideReact.Mail className="w-5 h-5 mr-2 text-orange-600" />
              Send Receipt via Email
            </DialogTitle>
            <DialogDescription>
              Enter the email address where you want to send the receipt for{" "}
              <span className="font-medium text-orange-700">
                {receipt.donorName}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
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
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
              {emailState.error && (
                <p className="flex items-center text-sm text-red-600">
                  <lucideReact.X className="w-3 h-3 mr-1" />
                  {emailState.error}
                </p>
              )}
            </div>

            <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
              <p className="mb-1 text-sm font-medium text-orange-800">
                Receipt Details:
              </p>
              <p className="text-sm text-orange-700">
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
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={emailState.isSending || !emailState.address.trim()}
              className="text-white bg-orange-600 hover:bg-orange-700"
            >
              {emailState.isSending ? (
                <>
                  <lucideReact.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <lucideReact.Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Toast Notification */}
      {showToast && (
        <div className="fixed z-50 duration-300 top-4 right-4 animate-in slide-in-from-top-2">
          <div className="max-w-md px-4 py-3 text-orange-800 border border-l-4 border-orange-200 rounded shadow-lg bg-orange-50 border-l-orange-500">
            <div className="flex items-center">
              <lucideReact.Check className="w-5 h-5 mr-2 text-orange-600" />
              <p className="font-medium">{toastMessage}</p>
              <button
                onClick={() => setShowToast(false)}
                className="ml-4 text-orange-600 transition-colors duration-200 hover:text-orange-800"
              >
                <lucideReact.X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <lucideReact.AlertTriangle className="w-5 h-5 mr-2" />
              Delete Receipt
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete receipt{" "}
              <span className="font-mono font-semibold">
                #{receipt.receiptNumber}
              </span>{" "}
              for <span className="font-semibold">{receipt.donorName}</span>?
              <br />
              <br />
              <span className="text-orange-600">
                This action can be undone by an administrator.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isUpdating}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDeleteReceipt?.(receipt.id);
                setShowDeleteConfirm(false);
                onClose();
              }}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isUpdating ? (
                <>
                  <lucideReact.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <lucideReact.Trash2 className="w-4 h-4 mr-2" />
                  Delete Receipt
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- ADDED: UI mapping and chooser so FE shows Nepali while BE keeps English keys ---
const DONATION_TYPE_LABELS: Record<string, string> = {
  "General Donation": "अक्षयकोष",
  "Seva Donation": "मुठ्ठी दान",
  Annadanam: "गुरुकुलम",
  "Vastra Danam": "जिन्सी सामग्री",
  "Building Fund": "भण्डारा",
  "Festival Sponsorship": "विशेष पूजा",
  "Puja Sponsorship": "आजीवन सदस्यता",
};

// prefer an explicit label, then mapping, then fallback humanized english
function getDisplayDonationType(
  type?: string | null,
  explicitLabel?: string | null
) {
  if (explicitLabel && String(explicitLabel).trim()) return explicitLabel;
  if (type && DONATION_TYPE_LABELS[String(type)])
    return DONATION_TYPE_LABELS[String(type)];
  return humanizeDonationType(type ?? undefined);
}
