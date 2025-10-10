"use client";

import { useAuth } from "@/components/context/AuthProvider";
import { useToast } from "@/components/context/ToastProvider";
import ReceiptForm from "@/components/forms/ReceiptForm";
import ReceiptModal from "@/components/modals/ReceiptModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDonationTypeLabel } from "@/lib/donation-labels";
import { formatDonationDate } from "@/lib/nepali-date-utils";
import {
  donationsService,
  donorsService,
  receiptsService,
} from "@/lib/supabase-services";
import { formatCurrency } from "@/lib/utils";
import { DonationType, Donor, PaymentMode } from "@/types";
import {
  AlertCircle,
  Eye,
  Filter,
  Loader2,
  Plus,
  Receipt as ReceiptIcon,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Receipt {
  id: string;
  receipt_number: string;
  issued_at: string;
  is_printed: boolean;
  is_email_sent: boolean;
  created_at: string;
  donation?: {
    amount: number;
    donation_type: string;
    payment_mode: string;
    date_of_donation: string;
    notes?: string;
    donor_id: string;
    donor?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      donation_type?: string;
      membership?: string;
    };
  };
}

export default function ReceiptsPage() {
  const { appUser } = useAuth();
  const { showToast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [creatingReceipt, setCreatingReceipt] = useState(false);
  const [updatingReceipt, setUpdatingReceipt] = useState<string | null>(null);
  const [donorHistory, setDonorHistory] = useState<
    Array<{
      id: string;
      amount: number;
      donation_type: string;
      payment_mode: string;
      date_of_donation: string;
      notes?: string;
    }>
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!appUser) return;

      try {
        setLoading(true);
        setError(null);

        const [receiptsData, donorsData] = await Promise.all([
          receiptsService.getAll(),
          donorsService.getAll(),
        ]);

        setReceipts(receiptsData);
        setDonors(donorsData);
      } catch (error) {
        console.error("Error loading data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load data";
        setError(errorMessage);
        // Only show toast on error to prevent infinite loop
        if (showToast) {
          showToast(`Error loading data: ${errorMessage}`, "destructive");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser]); // Only depend on appUser to prevent infinite loop

  const filteredReceipts = receipts.filter(
    (receipt) =>
      receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.donation?.donor?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleCreateReceipt = async (receiptData: {
    donorId: string;
    donorName: string;
    donationType: DonationType;
    amount: number;
    paymentMode: PaymentMode;
    dateOfDonation: Date;
    startDate?: Date | null;
    endDate?: Date | null;
    startDateNepali?: string;
    endDateNepali?: string;
    notes?: string;
  }) => {
    if (!appUser?.id) {
      showToast("User authentication required", "destructive");
      return;
    }

    try {
      setCreatingReceipt(true);
      setError(null);

      // Debug: Log the received data
      console.log("Receipt data received:", receiptData);

      // Validate input
      if (
        !receiptData.donorId ||
        !receiptData.amount ||
        receiptData.amount <= 0
      ) {
        throw new Error("Please provide valid donor and amount information");
      }

      // Create donation first
      const newDonation = await donationsService.create({
        donorId: receiptData.donorId,
        donationType: receiptData.donationType,
        amount: receiptData.amount,
        paymentMode: receiptData.paymentMode,
        dateOfDonation: receiptData.dateOfDonation,
        startDate: receiptData.startDate,
        endDate: receiptData.endDate,
        startDateNepali: receiptData.startDateNepali,
        endDateNepali: receiptData.endDateNepali,
        notes: receiptData.notes,
        createdBy: appUser.id,
      });

      if (!newDonation?.id) {
        throw new Error("Failed to create donation record");
      }

      // Create receipt for the donation
      const newReceipt = await receiptsService.create({
        donationId: newDonation.id,
        issuedAt: new Date(),
        isPrinted: false,
        isEmailSent: false,
      });

      if (!newReceipt) {
        throw new Error("Failed to create receipt");
      }

      // Reload data to get the complete receipt with relations
      const updatedReceipts = await receiptsService.getAll();
      setReceipts(updatedReceipts);

      setIsAddDialogOpen(false);
      showToast(
        `Receipt generated successfully for ${receiptData.donorName}! 🎉`
      );
    } catch (error) {
      console.error("Error creating receipt:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create receipt";
      setError(errorMessage);
      showToast(`Error creating receipt: ${errorMessage}`, "destructive");
    } finally {
      setCreatingReceipt(false);
    }
  };

  const handlePrintReceipt = async (receiptId: string) => {
    try {
      setUpdatingReceipt(receiptId);
      await receiptsService.updatePrintStatus(receiptId, true);

      // Update local state
      setReceipts(
        receipts.map((r) =>
          r.id === receiptId ? { ...r, is_printed: true } : r
        )
      );

      showToast("Receipt marked as printed ✅", "default");
    } catch (error) {
      console.error("Error updating print status:", error);
      showToast("Failed to update print status", "destructive");
    } finally {
      setUpdatingReceipt(null);
    }
  };

  const handleEmailReceipt = async (receiptId: string) => {
    try {
      setUpdatingReceipt(receiptId);
      await receiptsService.updateEmailStatus(receiptId, true);

      // Update local state
      setReceipts(
        receipts.map((r) =>
          r.id === receiptId ? { ...r, is_email_sent: true } : r
        )
      );

      showToast("Receipt marked as emailed 📧", "default");
    } catch (error) {
      console.error("Error updating email status:", error);
      showToast("Failed to update email status", "destructive");
    } finally {
      setUpdatingReceipt(null);
    }
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this receipt? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setUpdatingReceipt(receiptId);
      await receiptsService.delete(receiptId);

      // Remove from local state
      setReceipts(receipts.filter((r) => r.id !== receiptId));

      showToast("Receipt deleted successfully", "default");
    } catch (error) {
      console.error("Error deleting receipt:", error);
      showToast("Failed to delete receipt", "destructive");
    } finally {
      setUpdatingReceipt(null);
    }
  };

  const handleViewReceiptWithHistory = async (receipt: Receipt) => {
    setSelectedReceipt(receipt);

    // Load donor history using donor_id from donation
    const donorId = receipt.donation?.donor_id;
    if (donorId) {
      try {
        setLoadingHistory(true);
        const history = await receiptsService.getDonorHistory(donorId);
        setDonorHistory(history);
      } catch (error) {
        console.error("Error loading donor history:", error);
        setDonorHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    }

    setIsReceiptModalOpen(true);
  };

  // Stats calculations
  const totalReceipts = receipts.length;
  const totalAmount = receipts.reduce(
    (sum, r) => sum + Number(r.donation?.amount || 0),
    0
  );
  const printedReceipts = receipts.filter((r) => r.is_printed).length;
  const emailedReceipts = receipts.filter((r) => r.is_email_sent).length;

  if (loading) {
    return (
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-orange-500 animate-spin" />
            <p className="text-gray-600">Loading receipts data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <Card className="p-6 text-center border-red-200 bg-red-50">
            <CardContent>
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="mb-2 text-lg font-semibold text-red-800">
                Error Loading Data
              </h3>
              <p className="mb-4 text-red-600">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Receipt Management
          </h1>
          <p className="mt-2 text-gray-600">
            Generate and manage donation receipts
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              disabled={creatingReceipt}
            >
              {creatingReceipt ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Receipt
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate New Receipt</DialogTitle>
              <DialogDescription>
                Create a donation receipt for a donor contribution.
              </DialogDescription>
            </DialogHeader>
            <ReceiptForm
              donors={donors}
              onSubmit={handleCreateReceipt}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {totalReceipts}
              </p>
              <p className="text-sm text-gray-600">Total Receipts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {printedReceipts}
              </p>
              <p className="text-sm text-gray-600">Printed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {emailedReceipts}
              </p>
              <p className="text-sm text-gray-600">Emailed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Receipt Database</CardTitle>
          <CardDescription>
            Search and manage all generated receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6 space-x-4">
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              <Input
                placeholder="Search by receipt number or donor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Receipts Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Donation Type</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <ReceiptIcon className="w-4 h-4 mr-2 text-orange-600" />
                        <span className="font-mono text-sm">
                          {receipt.receipt_number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {receipt.donation?.donor?.name || "Unknown Donor"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-green-600">
                        {formatCurrency(Number(receipt.donation?.amount || 0))}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {receipt.donation?.donation_type
                          ? getDonationTypeLabel(receipt.donation.donation_type)
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          receipt.donation?.payment_mode === "Online"
                            ? "bg-blue-100 text-blue-800"
                            : receipt.donation?.payment_mode === "QR Payment"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {receipt.donation?.payment_mode || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {receipt.donation && receipt.donation.date_of_donation
                          ? formatDonationDate(receipt.donation)
                          : "N/A"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              receipt.is_printed
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <span className="text-xs">
                            {receipt.is_printed ? "Printed" : "Not Printed"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              receipt.is_email_sent
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <span className="text-xs">
                            {receipt.is_email_sent ? "Emailed" : "Not Emailed"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReceiptWithHistory(receipt)}
                          title="View Receipt & Manage Actions"
                          className="hover:bg-orange-50 hover:border-orange-200"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReceipts.length === 0 && !loading && (
            <div className="py-8 text-center">
              <p className="text-gray-500">
                {receipts.length === 0
                  ? "No receipts yet. Generate your first receipt to get started!"
                  : "No receipts found matching your search criteria."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={{
            id: selectedReceipt.id,
            receiptNumber: selectedReceipt.receipt_number,
            createdAt: new Date(selectedReceipt.issued_at),
            donorName: selectedReceipt.donation?.donor?.name || "Unknown",
            donationType:
              (selectedReceipt.donation?.donation_type as DonationType) ||
              "General Donation",
            amount: Number(selectedReceipt.donation?.amount || 0),
            paymentMode:
              (selectedReceipt.donation?.payment_mode as PaymentMode) ||
              "Offline",
            dateOfDonation: selectedReceipt.donation?.date_of_donation
              ? new Date(selectedReceipt.donation.date_of_donation)
              : new Date(),
            notes: selectedReceipt.donation?.notes,
            isPrinted: selectedReceipt.is_printed,
            isEmailSent: selectedReceipt.is_email_sent,
            donationId: selectedReceipt.id,
            donorId: selectedReceipt.donation?.donor_id || "",
            createdBy: "System",
            startDate: (selectedReceipt.donation as Record<string, unknown>)
              ?.start_date
              ? new Date(
                  (selectedReceipt.donation as Record<string, unknown>)
                    .start_date as string
                )
              : null,
            endDate: (selectedReceipt.donation as Record<string, unknown>)
              ?.end_date
              ? new Date(
                  (selectedReceipt.donation as Record<string, unknown>)
                    .end_date as string
                )
              : null,
            startDateNepali:
              ((selectedReceipt.donation as Record<string, unknown>)
                ?.start_date_nepali as string) || undefined,
            endDateNepali:
              ((selectedReceipt.donation as Record<string, unknown>)
                ?.end_date_nepali as string) || undefined,
          }}
          donorHistory={donorHistory}
          loadingHistory={loadingHistory}
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          onMarkPrinted={handlePrintReceipt}
          onMarkEmailed={handleEmailReceipt}
          onDeleteReceipt={handleDeleteReceipt}
          isUpdating={!!updatingReceipt}
        />
      )}
    </div>
  );
}
