"use client";

import { useAuth } from "@/components/context/AuthProvider";
import { useToast } from "@/components/context/ToastProvider";
import DonorForm from "@/components/forms/DonorForm";
import DonorProfileModal from "@/components/modals/DonorProfileModal";
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
  Filter,
  Mail,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

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

    return matchesSearch && matchesDonationType;
  });

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
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
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
                  {filteredDonors.map((donor) => (
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

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
    </div>
  );
}
