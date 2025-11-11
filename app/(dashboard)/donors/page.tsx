"use client";

import { useAuth } from "@/components/context/AuthProvider";
import { useToast } from "@/components/context/ToastProvider";
import DonorForm from "@/components/forms/DonorForm";
import DonorProfileModal from "@/components/modals/DonorProfileModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDonationTypeLabel } from "@/lib/donation-labels";
import { englishToNepaliDateFormatted } from "@/lib/nepali-date-utils";
import { donorsService, receiptsService } from "@/lib/supabase-services";
import { formatCurrency } from "@/lib/utils";
import { type DonationType, type MembershipType } from "@/types";
import {
  Calendar,
  Edit,
  Eye,
  FileDown,
  Filter,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface Donor {
  id: string;
  name: string;
  date_of_birth?: string;
  phone?: string;
  address?: string;
  email?: string;
  donation_type: string;
  membership: string;
  notes?: string;
  total_donations: number;
  last_donation_date?: string;
  created_at: string;
  updated_at: string;
}

export default function DonorsPage() {
  const { appUser } = useAuth();
  const { showToast } = useToast();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [donationTypeFilter, setDonationTypeFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [donorToEdit, setDonorToEdit] = useState<Donor | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [donorHistory, setDonorHistory] = useState<
    Array<{
      id: string;
      amount: number;
      donation_type: string;
      payment_mode: string;
      date_of_donation: string;
      notes?: string;
      receipt_number?: string;
    }>
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Form submission loading states
  const [isSubmittingDonor, setIsSubmittingDonor] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [donorToDelete, setDonorToDelete] = useState<Donor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadDonors = async () => {
      try {
        const data = await donorsService.getAll();
        setDonors(data);
      } catch (error) {
        console.error("Error loading donors:", error);
      } finally {
        setLoading(false);
      }
    };

    if (appUser) {
      loadDonors();
    }
  }, [appUser]);

  // Function to refresh donors list
  const refreshDonors = async () => {
    try {
      const data = await donorsService.getAll();
      setDonors(data);
    } catch (error) {
      console.error("Error refreshing donors:", error);
      showToast("Failed to refresh donors list", "destructive");
    }
  };

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone?.includes(searchTerm) ||
      donor.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDonationType =
      donationTypeFilter === "all" ||
      donor.donation_type === donationTypeFilter;

    const matchesMembership =
      membershipFilter === "all" || donor.membership === membershipFilter;

    return matchesSearch && matchesDonationType && matchesMembership;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDonors = filteredDonors.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  // Update useEffect to reset page when search/filter changes
  useEffect(() => {
    resetToFirstPage();
  }, [searchTerm, donationTypeFilter, membershipFilter]);

  const handleViewProfile = async (donor: Donor) => {
    setSelectedDonor(donor);
    setIsProfileModalOpen(true);

    // Load donor history
    try {
      setLoadingHistory(true);
      const history = await receiptsService.getDonorHistory(donor.id);
      setDonorHistory(history);
    } catch (error) {
      console.error("Error loading donor history:", error);
      setDonorHistory([]);
      showToast("Failed to load donor history", "destructive");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEditDonor = (donor: Donor) => {
    setDonorToEdit(donor);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDonor = (donor: Donor) => {
    setDonorToDelete(donor);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDonor = async () => {
    if (!donorToDelete) return;

    setIsDeleting(true);
    try {
      await donorsService.delete(donorToDelete.id);

      // Remove donor from local state
      setDonors(donors.filter((d) => d.id !== donorToDelete.id));

      setShowDeleteConfirm(false);
      setDonorToDelete(null);

      showToast(
        `${donorToDelete.name} deleted successfully! 🗑️`,
        "The donor has been removed from the database.",
        "default"
      );
    } catch (error) {
      console.error("Error deleting donor:", error);
      showToast(
        "Failed to delete donor",
        "There was an error deleting the donor. Please try again.",
        "destructive"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateDonor = async (donorData: {
    name: string;
    dateOfBirth: string;
    phone: string;
    address: string;
    email: string;
    donationType: string;
    membership: string;
    notes: string;
  }) => {
    if (!donorToEdit) return;

    setIsSubmittingDonor(true);
    try {
      const updatedDonor = await donorsService.update(donorToEdit.id, {
        name: donorData.name,
        dateOfBirth: donorData.dateOfBirth
          ? new Date(donorData.dateOfBirth)
          : undefined,
        phone: donorData.phone,
        address: donorData.address,
        email: donorData.email,
        donationType: donorData.donationType as DonationType,
        membership: donorData.membership as MembershipType,
        notes: donorData.notes,
      });

      // Update the donor in the local state with the data returned from the database
      setDonors(
        donors.map((d) => (d.id === donorToEdit.id ? updatedDonor : d))
      );

      setIsEditDialogOpen(false);
      setDonorToEdit(null);
      showToast(`${donorData.name} updated successfully! ✅`, "default");

      // Refresh the list to ensure we have the latest data
      await refreshDonors();
    } catch (error) {
      console.error("Error updating donor:", error);
      showToast("Failed to update donor", "destructive");
    } finally {
      setIsSubmittingDonor(false);
    }
  };

  const handleAddDonor = async (donorData: {
    name: string;
    dateOfBirth: string;
    phone: string;
    address: string;
    email: string;
    donationType: string;
    membership: string;
    notes: string;
  }) => {
    setIsSubmittingDonor(true);
    try {
      const newDonor = await donorsService.create({
        name: donorData.name,
        dateOfBirth: donorData.dateOfBirth
          ? new Date(donorData.dateOfBirth)
          : undefined,
        phone: donorData.phone || undefined,
        address: donorData.address || undefined,
        email: donorData.email || undefined,
        donationType: donorData.donationType as DonationType,
        membership: donorData.membership as MembershipType,
        notes: donorData.notes || undefined,
        totalDonations: 0,
        lastDonationDate: null,
      });

      // Add the new donor returned from the database to the top of the list
      setDonors([newDonor, ...donors]);
      setIsAddDialogOpen(false);

      // Show beautiful success toast
      showToast(
        "Donor Added Successfully! 🎉",
        `${donorData.name} has been added to the database with ${donorData.membership} membership.`,
        "success"
      );

      // Refresh the list to ensure we have the latest data
      await refreshDonors();
    } catch (error) {
      console.error("Error adding donor:", error);

      // Show error toast instead of alert
      showToast(
        "Failed to Add Donor",
        "There was an error adding the donor. Please check your information and try again.",
        "destructive"
      );
    } finally {
      setIsSubmittingDonor(false);
    }
  };

  // Excel export function
  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = filteredDonors.map((donor, index) => ({
        "S.N.": index + 1,
        Name: donor.name,
        Phone: donor.phone || "N/A",
        Email: donor.email || "N/A",
        "Date of Birth": donor.date_of_birth
          ? englishToNepaliDateFormatted(new Date(donor.date_of_birth))
          : "N/A",
        Address: donor.address || "N/A",
        "Membership Type": donor.membership,
        "Donation Type": getDonationTypeLabel(donor.donation_type),
        "Total Contributions": `Rs. ${Number(
          donor.total_donations || 0
        ).toLocaleString()}`,
        "Last Donation Date": donor.last_donation_date
          ? englishToNepaliDateFormatted(new Date(donor.last_donation_date))
          : "No donations",
        Notes: donor.notes || "N/A",
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better formatting
      const colWidths = [
        { wch: 8 }, // S.N.
        { wch: 25 }, // Name
        { wch: 15 }, // Phone
        { wch: 30 }, // Email
        { wch: 15 }, // Date of Birth
        { wch: 30 }, // Address
        { wch: 15 }, // Membership Type
        { wch: 20 }, // Donation Type
        { wch: 18 }, // Total Contributions
        { wch: 18 }, // Last Donation Date
        { wch: 30 }, // Notes
      ];
      worksheet["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Donors");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `donors_export_${currentDate}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, filename);

      // Show success message
      showToast(
        "Export Successful! 📊",
        `Donor data has been exported to ${filename}`,
        "success"
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showToast(
        "Export Failed",
        "There was an error exporting the data. Please try again.",
        "destructive"
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Stats calculations
  const totalDonors = donors.length;
  const lifeMembers = donors.filter((d) => d.membership === "Life").length;
  const totalCollected = donors.reduce(
    (sum, d) => sum + Number(d.total_donations || 0),
    0
  );
  const activeThisMonth = donors.filter((d) => {
    if (!d.last_donation_date) return false;
    const lastDonation = new Date(d.last_donation_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastDonation > thirtyDaysAgo;
  }).length;

  if (loading) {
    return (
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-b-2 border-orange-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col mb-8 space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Donors Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage donor information and track contributions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-orange-600 hover:bg-orange-700 sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add New Donor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Add New Donor</DialogTitle>
              <DialogDescription>
                Fill in the donor information to onboard them to the system.
              </DialogDescription>
            </DialogHeader>
            <DonorForm
              onSubmit={handleAddDonor}
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={isSubmittingDonor}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Donor Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Edit Donor Information</DialogTitle>
              <DialogDescription>
                Update the donor&apos;s information and preferences.
              </DialogDescription>
            </DialogHeader>
            {donorToEdit && (
              <DonorForm
                initialData={{
                  name: donorToEdit.name,
                  dateOfBirth: donorToEdit.date_of_birth
                    ? new Date(donorToEdit.date_of_birth)
                    : undefined,
                  phone: donorToEdit.phone || "",
                  address: donorToEdit.address || "",
                  email: donorToEdit.email || "",
                  donationType: donorToEdit.donation_type as DonationType,
                  membership: donorToEdit.membership as MembershipType,
                  notes: donorToEdit.notes || "",
                }}
                onSubmit={handleUpdateDonor}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setDonorToEdit(null);
                }}
                isSubmitting={isSubmittingDonor}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                {totalDonors}
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">Total Donors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                {lifeMembers}
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">Life Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                {formatCurrency(totalCollected)}
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">
                Total Collected
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                {activeThisMonth}
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">
                Active This Month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Donor Database</CardTitle>
          <CardDescription>
            Search and manage all registered donors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <div className="relative">
                <Filter className="absolute z-10 w-4 h-4 text-gray-400 left-3 top-3" />
                <Select
                  value={donationTypeFilter}
                  onValueChange={setDonationTypeFilter}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Filter by donation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Donation Types</SelectItem>
                    <SelectItem value="General Donation">
                      {getDonationTypeLabel("General Donation")}
                    </SelectItem>
                    <SelectItem value="Seva Donation">
                      {getDonationTypeLabel("Seva Donation")}
                    </SelectItem>
                    <SelectItem value="Annadanam">
                      {getDonationTypeLabel("Annadanam")}
                    </SelectItem>
                    <SelectItem value="Vastra Danam">
                      {getDonationTypeLabel("Vastra Danam")}
                    </SelectItem>
                    <SelectItem value="Building Fund">
                      {getDonationTypeLabel("Building Fund")}
                    </SelectItem>
                    <SelectItem value="Festival Sponsorship">
                      {getDonationTypeLabel("Festival Sponsorship")}
                    </SelectItem>
                    <SelectItem value="Puja Sponsorship">
                      {getDonationTypeLabel("Puja Sponsorship")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full sm:w-48">
              <div className="relative">
                <Filter className="absolute z-10 w-4 h-4 text-gray-400 left-3 top-3" />
                <Select
                  value={membershipFilter}
                  onValueChange={setMembershipFilter}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Filter by membership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Memberships</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Life">Life</SelectItem>
                    <SelectItem value="Special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleExportToExcel}
              disabled={isExporting}
              variant="outline"
              className="flex items-center w-full gap-2 text-green-700 border-green-200 sm:w-auto bg-green-50 hover:bg-green-100 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              {isExporting ? "Exporting..." : "Export to Excel"}
            </Button>
          </div>

          {/* Donors Table */}
          <div className="overflow-x-auto border rounded-lg">
            <div className="min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[120px] hidden sm:table-cell">
                      Contact
                    </TableHead>
                    <TableHead className="min-w-[100px]">Membership</TableHead>
                    <TableHead className="min-w-[120px] hidden lg:table-cell">
                      Donation Type
                    </TableHead>
                    <TableHead className="min-w-[140px]">
                      Total Contributions
                    </TableHead>
                    <TableHead className="min-w-[120px] hidden md:table-cell">
                      Last Donation
                    </TableHead>
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDonors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell className="min-w-[150px]">
                        <div>
                          <p className="text-sm font-medium text-gray-900 sm:text-base">
                            {donor.name}
                          </p>
                          <p className="text-xs text-gray-500 sm:text-sm">
                            {donor.date_of_birth
                              ? englishToNepaliDateFormatted(
                                  new Date(donor.date_of_birth)
                                )
                              : "N/A"}
                          </p>
                          {/* Show contact info on mobile when Contact column is hidden */}
                          <div className="block mt-1 sm:hidden">
                            <div className="flex items-center text-xs">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              {donor.phone || "N/A"}
                            </div>
                            {donor.email && (
                              <div className="flex items-center text-xs text-gray-600">
                                <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                {donor.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[120px] hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-2 text-gray-400" />
                            {donor.phone || "N/A"}
                          </div>
                          {donor.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-3 h-3 mr-2 text-gray-400" />
                              {donor.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            donor.membership === "Life"
                              ? "bg-green-100 text-green-800"
                              : donor.membership === "Special"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {donor.membership}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[120px] hidden lg:table-cell">
                        <span className="text-sm">
                          {getDonationTypeLabel(donor.donation_type)}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[140px]">
                        <p className="text-sm font-medium sm:text-base">
                          {formatCurrency(Number(donor.total_donations || 0))}
                        </p>
                      </TableCell>
                      <TableCell className="min-w-[120px] hidden md:table-cell">
                        {donor.last_donation_date ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                            {englishToNepaliDateFormatted(
                              new Date(donor.last_donation_date)
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No donations</span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProfile(donor)}
                            className="p-2"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDonor(donor)}
                            className="p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDonor(donor)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
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
          {filteredDonors.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredDonors.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}

          {filteredDonors.length === 0 && !loading && (
            <div className="py-8 text-center">
              <p className="text-gray-500">
                {donors.length === 0
                  ? "No donors yet. Add your first donor to get started!"
                  : searchTerm || donationTypeFilter !== "all"
                  ? "No donors found matching your search criteria or filter."
                  : "No donors found."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donor Profile Modal */}
      {selectedDonor && (
        <DonorProfileModal
          donor={{
            id: selectedDonor.id,
            name: selectedDonor.name,
            dateOfBirth: selectedDonor.date_of_birth
              ? new Date(selectedDonor.date_of_birth)
              : undefined,
            phone: selectedDonor.phone,
            address: selectedDonor.address,
            email: selectedDonor.email,
            donationType: selectedDonor.donation_type as "General Donation",
            membership: selectedDonor.membership as "Regular",
            notes: selectedDonor.notes,
            totalDonations: Number(selectedDonor.total_donations || 0),
            lastDonationDate: selectedDonor.last_donation_date
              ? new Date(selectedDonor.last_donation_date)
              : undefined,
            createdAt: new Date(selectedDonor.created_at),
            updatedAt: new Date(selectedDonor.updated_at),
          }}
          donorHistory={donorHistory}
          loadingHistory={loadingHistory}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Donor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{donorToDelete?.name}</span>? This
              action will soft delete the donor and they will no longer appear
              in the donors list. This action can be reversed by a database
              administrator if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDonor}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Donor
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
