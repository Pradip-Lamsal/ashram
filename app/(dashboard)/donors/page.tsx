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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { donorsService } from "@/lib/supabase-services";
import { formatCurrency, formatDate } from "@/lib/utils";
import { type DonationType, type MembershipType } from "@/types";
import { Calendar, Edit, Eye, Mail, Phone, Plus, Search } from "lucide-react";
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
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const filteredDonors = donors.filter(
    (donor) =>
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone?.includes(searchTerm) ||
      donor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProfile = (donor: Donor) => {
    setSelectedDonor(donor);
    setIsProfileModalOpen(true);
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

      setDonors([newDonor, ...donors]);
      setIsAddDialogOpen(false);

      // Show beautiful success toast
      showToast(
        "Donor Added Successfully! 🎉",
        `${donorData.name} has been added to the database with ${donorData.membership} membership.`,
        "success"
      );
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
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-b-2 border-orange-500 rounded-full animate-spin"></div>
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
            Donors Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage donor information and track contributions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Donor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{totalDonors}</p>
              <p className="text-sm text-gray-600">Total Donors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{lifeMembers}</p>
              <p className="text-sm text-gray-600">Life Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalCollected)}
              </p>
              <p className="text-sm text-gray-600">Total Collected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {activeThisMonth}
              </p>
              <p className="text-sm text-gray-600">Active This Month</p>
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
          <div className="flex items-center mb-6 space-x-4">
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Donors Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Donation Type</TableHead>
                  <TableHead>Total Contributions</TableHead>
                  <TableHead>Last Donation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {donor.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {donor.date_of_birth
                            ? formatDate(new Date(donor.date_of_birth))
                            : "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                    <TableCell>
                      <span className="text-sm">{donor.donation_type}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {formatCurrency(Number(donor.total_donations || 0))}
                      </p>
                    </TableCell>
                    <TableCell>
                      {donor.last_donation_date ? (
                        <div className="flex items-center text-sm">
                          <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                          {formatDate(new Date(donor.last_donation_date))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No donations</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(donor)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDonors.length === 0 && !loading && (
            <div className="py-8 text-center">
              <p className="text-gray-500">
                {donors.length === 0
                  ? "No donors yet. Add your first donor to get started!"
                  : "No donors found matching your search criteria."}
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
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
