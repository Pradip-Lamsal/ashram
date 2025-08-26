"use client";

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
import { mockDonors } from "@/data/mockData";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Donor } from "@/types";
import { Calendar, Edit, Eye, Mail, Phone, Plus, Search } from "lucide-react";
import { useState } from "react";

export default function DonorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const filteredDonors = mockDonors.filter(
    (donor) =>
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone.includes(searchTerm) ||
      donor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProfile = (donor: Donor) => {
    setSelectedDonor(donor);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Donors Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage donor information and track contributions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
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
              onSubmit={(donorData) => {
                console.log("New donor:", donorData);
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
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {mockDonors.length}
              </p>
              <p className="text-sm text-gray-600">Total Donors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {mockDonors.filter((d) => d.membership === "Life").length}
              </p>
              <p className="text-sm text-gray-600">Life Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  mockDonors.reduce((sum, d) => sum + d.totalDonations, 0)
                )}
              </p>
              <p className="text-sm text-gray-600">Total Collected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {
                  mockDonors.filter(
                    (d) =>
                      d.lastDonationDate &&
                      new Date().getTime() - d.lastDonationDate.getTime() <
                        30 * 24 * 60 * 60 * 1000
                  ).length
                }
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
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                          {formatDate(donor.dateOfBirth)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-3 w-3 text-gray-400" />
                          {donor.phone}
                        </div>
                        {donor.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="mr-2 h-3 w-3 text-gray-400" />
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
                      <span className="text-sm">{donor.donationType}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {formatCurrency(donor.totalDonations)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {donor.lastDonationDate ? (
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-3 w-3 text-gray-400" />
                          {formatDate(donor.lastDonationDate)}
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
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDonors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No donors found matching your search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donor Profile Modal */}
      {selectedDonor && (
        <DonorProfileModal
          donor={selectedDonor}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
