"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { mockDonors, mockSMSEvents } from "@/data/mockData";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  Calendar,
  Eye,
  History,
  MessageSquare,
  Plus,
  Search,
  Send,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [smsForm, setSmsForm] = useState({
    eventName: "",
    messageContent: "",
    recipients: [] as string[],
  });
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCreateSMSDialogOpen, setIsCreateSMSDialogOpen] = useState(false);

  const filteredDonors = mockDonors.filter(
    (donor) =>
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone.includes(searchTerm)
  );

  const filteredSMSEvents = mockSMSEvents.filter((event) =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDonorSelection = (donorId: string, checked: boolean) => {
    if (checked) {
      setSelectedDonors((prev) => [...prev, donorId]);
    } else {
      setSelectedDonors((prev) => prev.filter((id) => id !== donorId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDonors(filteredDonors.map((d) => d.id));
    } else {
      setSelectedDonors([]);
    }
  };

  const handlePreviewMessage = () => {
    setSmsForm((prev) => ({ ...prev, recipients: selectedDonors }));
    setIsPreviewModalOpen(true);
  };

  const handleSendSMS = () => {
    console.log("Sending SMS:", smsForm);
    alert(`SMS sent to ${selectedDonors.length} recipients!`);
    setIsCreateSMSDialogOpen(false);
    setIsPreviewModalOpen(false);
    setSmsForm({ eventName: "", messageContent: "", recipients: [] });
    setSelectedDonors([]);
  };

  return (
    <div className="px-6 py-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Events & SMS Management
          </h1>
          <p className="mt-2 text-gray-600">
            Send bulk SMS notifications and manage event communications
          </p>
        </div>
        <Dialog
          open={isCreateSMSDialogOpen}
          onOpenChange={setIsCreateSMSDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Create SMS Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create SMS Campaign</DialogTitle>
              <DialogDescription>
                Send bulk SMS notifications to selected donors
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="compose" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compose">Compose Message</TabsTrigger>
                <TabsTrigger value="recipients">Select Recipients</TabsTrigger>
              </TabsList>

              <TabsContent value="compose" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Event/Campaign Name</Label>
                    <Input
                      id="eventName"
                      value={smsForm.eventName}
                      onChange={(e) =>
                        setSmsForm((prev) => ({
                          ...prev,
                          eventName: e.target.value,
                        }))
                      }
                      placeholder="e.g., Janmashtami Celebration"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="messageContent">Message Content</Label>
                    <Textarea
                      id="messageContent"
                      value={smsForm.messageContent}
                      onChange={(e) =>
                        setSmsForm((prev) => ({
                          ...prev,
                          messageContent: e.target.value,
                        }))
                      }
                      placeholder="Write your message here..."
                      className="min-h-[120px]"
                    />
                    <p className="text-sm text-gray-500">
                      {smsForm.messageContent.length}/160 characters
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50">
                    <h4 className="mb-2 font-medium text-blue-800">
                      Message Preview
                    </h4>
                    <p className="p-3 text-blue-700 bg-white border rounded">
                      {smsForm.messageContent ||
                        "Your message will appear here..."}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recipients" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 mr-4">
                    <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                    <Input
                      placeholder="Search donors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="selectAll"
                      checked={
                        selectedDonors.length === filteredDonors.length &&
                        filteredDonors.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="selectAll" className="text-sm">
                      Select All ({filteredDonors.length})
                    </Label>
                  </div>
                </div>

                <div className="overflow-y-auto border rounded-lg max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Membership</TableHead>
                        <TableHead>Last Donation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDonors.map((donor) => (
                        <TableRow key={donor.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedDonors.includes(donor.id)}
                              onCheckedChange={(checked: boolean) =>
                                handleDonorSelection(donor.id, checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {donor.name}
                          </TableCell>
                          <TableCell>{donor.phone}</TableCell>
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
                            {donor.lastDonationDate
                              ? formatDate(donor.lastDonationDate)
                              : "Never"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600">
                    <strong>{selectedDonors.length}</strong> recipients selected
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-4 space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateSMSDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handlePreviewMessage}
                disabled={
                  !smsForm.eventName ||
                  !smsForm.messageContent ||
                  selectedDonors.length === 0
                }
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total SMS Sent
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockSMSEvents.reduce(
                    (total, event) => total + event.totalRecipients,
                    0
                  )}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockSMSEvents.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Donors
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockDonors.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    mockSMSEvents.filter(
                      (event) =>
                        new Date().getMonth() === event.sentDate.getMonth()
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <History className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SMS History */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Campaign History</CardTitle>
          <CardDescription>
            View all sent SMS campaigns and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6 space-x-4">
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSMSEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {event.eventName}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-600 truncate">
                        {event.messageContent}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event.totalRecipients} recipients
                      </span>
                    </TableCell>
                    <TableCell>{formatDateTime(event.sentDate)}</TableCell>
                    <TableCell>{event.createdBy}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSMSEvents.length === 0 && (
            <div className="py-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No SMS campaigns found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview SMS Campaign</DialogTitle>
            <DialogDescription>
              Review your message before sending to {selectedDonors.length}{" "}
              recipients
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium">Event Name</Label>
                  <p className="text-gray-900">{smsForm.eventName}</p>
                </div>
                <div>
                  <Label className="font-medium">Message Content</Label>
                  <div className="p-3 mt-2 rounded-lg bg-gray-50">
                    <p className="text-gray-900">{smsForm.messageContent}</p>
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Recipients</Label>
                  <p className="text-gray-600">
                    {selectedDonors.length} donors selected
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Edit Message
              </Button>
              <Button
                onClick={handleSendSMS}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send SMS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
