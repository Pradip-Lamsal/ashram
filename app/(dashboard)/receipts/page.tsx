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
import { Pagination } from "@/components/ui/pagination";
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Form submission loading state
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

    setIsSubmittingReceipt(true);
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
      setIsSubmittingReceipt(false);
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

      // Update selectedReceipt if it's the same receipt
      if (selectedReceipt && selectedReceipt.id === receiptId) {
        setSelectedReceipt({ ...selectedReceipt, is_printed: true });
      }

      showToast("Receipt marked as printed ✅", "default");
    } catch (error) {
      // Handle print status update error gracefully
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.warn("Failed to update print status:", errorMessage);
      showToast(
        "Could not update print status",
        "The receipt action was attempted but the status could not be updated.",
        "destructive"
      );
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

      // Update selectedReceipt if it's the same receipt
      if (selectedReceipt && selectedReceipt.id === receiptId) {
        setSelectedReceipt({ ...selectedReceipt, is_email_sent: true });
      }

      showToast("Receipt marked as emailed 📧", "default");
    } catch (error) {
      // Handle email status update error gracefully
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.warn("Failed to update email status:", errorMessage);
      showToast(
        "Could not update email status",
        "The receipt action was attempted but the status could not be updated.",
        "destructive"
      );
    } finally {
      setUpdatingReceipt(null);
    }
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    try {
      setUpdatingReceipt(receiptId);
      await receiptsService.delete(receiptId);

      // Remove from local state
      setReceipts(receipts.filter((r) => r.id !== receiptId));

      // Close modal if the deleted receipt was selected
      if (selectedReceipt && selectedReceipt.id === receiptId) {
        setSelectedReceipt(null);
        setIsReceiptModalOpen(false);
      }

      showToast("Receipt deleted successfully", "default");
    } catch (error) {
      // Handle receipt deletion error gracefully
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.warn("Failed to delete receipt:", errorMessage);
      showToast(
        "Could not delete receipt",
        "The receipt could not be deleted. Please try again.",
        "destructive"
      );
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
      <div className="px-4 py-6 mx-auto sm:px-6 sm:py-8 max-w-7xl">
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
      <div className="px-4 py-6 mx-auto sm:px-6 sm:py-8 max-w-7xl">
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
    <div className="px-4 py-6 mx-auto sm:px-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Receipt Management
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Generate and manage donation receipts
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 sm:w-auto"
              disabled={creatingReceipt}
            >
              {creatingReceipt ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                  <span className="sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Generate Receipt</span>
                  <span className="sm:hidden">Generate</span>
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
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
              isSubmitting={isSubmittingReceipt}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 sm:text-2xl">
                {totalReceipts}
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">Total Receipts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 sm:text-2xl">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">Total Amount</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 sm:text-2xl">
                {printedReceipts}
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">Printed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 sm:text-2xl">
                {emailedReceipts}
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">Emailed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Receipt Database</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Search and manage all generated receipts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
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
          </div>

          {/* Receipts Table */}
          <div className="overflow-hidden border rounded-lg">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      Receipt Number
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Donor</TableHead>
                    <TableHead className="whitespace-nowrap">Amount</TableHead>
                    <TableHead className="hidden whitespace-nowrap sm:table-cell">
                      Donation Type
                    </TableHead>
                    <TableHead className="hidden whitespace-nowrap md:table-cell">
                      Payment Mode
                    </TableHead>
                    <TableHead className="hidden whitespace-nowrap lg:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="hidden whitespace-nowrap xl:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <ReceiptIcon className="flex-shrink-0 w-4 h-4 mr-2 text-orange-600" />
                          <span className="font-mono text-xs sm:text-sm">
                            {receipt.receipt_number}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[120px] sm:max-w-none">
                        <p className="text-sm font-medium truncate">
                          {receipt.donation?.donor?.name || "Unknown Donor"}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(
                            Number(receipt.donation?.amount || 0)
                          )}
                        </p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-xs sm:text-sm">
                          {receipt.donation?.donation_type
                            ? getDonationTypeLabel(
                                receipt.donation.donation_type
                              )
                            : "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
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
                      <TableCell className="hidden lg:table-cell">
                        <p className="text-xs sm:text-sm">
                          {receipt.donation && receipt.donation.date_of_donation
                            ? formatDonationDate(receipt.donation)
                            : "N/A"}
                        </p>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
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
                              {receipt.is_email_sent
                                ? "Emailed"
                                : "Not Emailed"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleViewReceiptWithHistory(receipt)
                            }
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
          </div>

          {/* Pagination */}
          {filteredReceipts.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredReceipts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}

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
