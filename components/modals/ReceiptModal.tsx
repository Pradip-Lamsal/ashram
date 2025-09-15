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
  User,
  X,
} from "lucide-react";
import { useRef } from "react";
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
  onCreateReceipt?: () => void;
  onEditDonor?: () => void;
  onViewAllReceipts?: () => void;
}

export default function ReceiptModal({
  receipt,
  isOpen,
  onClose,
  donorHistory = [],
  loadingHistory = false,
  onCreateReceipt,
  onEditDonor,
  onViewAllReceipts,
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
    // Use the real receipt data for email functionality
    console.log("Sending email receipt for:", receipt.receiptNumber);
    console.log("Donor:", receipt.donorName);
    console.log("Amount:", formatCurrency(receipt.amount || 0));
    // TODO: Integrate with actual email service
    alert(
      `Email receipt for ${receipt.receiptNumber} sent to ${receipt.donorName}!`
    );
  };

  const handleDownloadPDF = () => {
    // Generate and download PDF with real receipt data
    const htmlContent = `
      <html>
        <head>
          <title>Receipt ${receipt.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .receipt-details { margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .amount { font-size: 24px; font-weight: bold; color: green; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Ashram Donation Receipt</h1>
            <h2>Receipt #${receipt.receiptNumber}</h2>
          </div>
          <div class="receipt-details">
            <div class="detail-row"><strong>Donor:</strong> ${
              receipt.donorName
            }</div>
            <div class="detail-row"><strong>Donation Type:</strong> ${
              receipt.donationType
            }</div>
            <div class="detail-row"><strong>Amount:</strong> <span class="amount">₹${
              receipt.amount
            }</span></div>
            <div class="detail-row"><strong>Date Issued:</strong> ${formatDate(
              receipt.createdAt
            )}</div>
            <div class="detail-row"><strong>Payment Mode:</strong> ${
              receipt.paymentMode
            }</div>
            ${
              receipt.notes
                ? `<div class="detail-row"><strong>Notes:</strong> ${receipt.notes}</div>`
                : ""
            }
          </div>
          <div style="margin-top: 40px;">
            <p>Thank you for your generous donation!</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Calculate donor totals from history
  const totalDonations = donorHistory.reduce(
    (sum, donation) => sum + (donation.amount || 0),
    0
  );
  const donationCount = donorHistory.length;

  return (
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
              <Button variant="outline" onClick={handleDownloadPDF}>
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
                    Ashram Donation Receipt
                  </h1>
                </div>
                <p className="text-gray-600">
                  Receipt #{receipt.receiptNumber}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Thank you for your generous donation
                </p>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Receipt Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Receipt Number:</span>
                      <span className="font-medium">
                        {receipt.receiptNumber}
                      </span>
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
                    <p className="text-sm text-gray-600 mb-2">
                      Amount in Words
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {receipt.amount
                        ? `Rupees ${receipt.amount.toLocaleString(
                            "en-IN"
                          )} Only`
                        : "Amount not specified"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="border-t pt-6 mt-8">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Thank you for your generous donation!
                  </p>
                  <p className="text-xs text-gray-500">
                    Receipt generated on {formatDateTime(new Date())}
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
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {donation.donation_type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(new Date(donation.date_of_donation))}
                          </p>
                          {donation.notes && (
                            <p className="text-xs text-gray-500 mt-1">
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
                  <p className="text-center text-gray-500 py-8">
                    No donation history found for this donor.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={onCreateReceipt}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!onCreateReceipt}
              >
                Create New Receipt
              </Button>
              <Button
                variant="outline"
                onClick={onEditDonor}
                disabled={!onEditDonor}
              >
                Edit Donor Info
              </Button>
              <Button
                variant="outline"
                onClick={onViewAllReceipts}
                disabled={!onViewAllReceipts}
              >
                View All Receipts
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
