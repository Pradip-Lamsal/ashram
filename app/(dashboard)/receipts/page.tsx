"use client";

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
import { mockReceipts } from "@/data/mockData";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Receipt } from "@/types";
import {
  Download,
  Edit,
  Eye,
  Filter,
  Mail,
  Plus,
  Printer,
  Receipt as ReceiptIcon,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function ReceiptsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const filteredReceipts = mockReceipts.filter(
    (receipt) =>
      receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.donationType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  const totalAmount = mockReceipts.reduce(
    (sum, receipt) => sum + receipt.amount,
    0
  );
  const totalReceipts = mockReceipts.length;
  const printedReceipts = mockReceipts.filter((r) => r.isPrinted).length;
  const emailedReceipts = mockReceipts.filter((r) => r.isEmailSent).length;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Receipt Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create, view, and manage donation receipts
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Create New Receipt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Receipt</DialogTitle>
              <DialogDescription>
                Generate a new donation receipt for a donor.
              </DialogDescription>
            </DialogHeader>
            <ReceiptForm
              onSubmit={(receiptData) => {
                console.log("New receipt:", receiptData);
                setIsAddDialogOpen(false);
              }}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Receipts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalReceipts}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <ReceiptIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Download className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Printed</p>
                <p className="text-2xl font-bold text-purple-600">
                  {printedReceipts}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Printer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emailed</p>
                <p className="text-2xl font-bold text-orange-600">
                  {emailedReceipts}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
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
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by receipt number, donor name, or donation type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Receipts Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">
                      {receipt.receiptNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {receipt.donorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {receipt.donorId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(receipt.dateOfDonation)}</TableCell>
                    <TableCell>
                      <span className="text-sm">{receipt.donationType}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-green-600">
                        {formatCurrency(receipt.amount)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          receipt.paymentMode === "Online"
                            ? "bg-blue-100 text-blue-800"
                            : receipt.paymentMode === "QR Payment"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {receipt.paymentMode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {receipt.isPrinted && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Printed
                          </span>
                        )}
                        {receipt.isEmailSent && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Emailed
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReceipt(receipt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReceipts.length === 0 && (
            <div className="text-center py-8">
              <ReceiptIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No receipts found matching your search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}
    </div>
  );
}
