"use client";

import { useAuth } from "@/components/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, Plus, Users } from "lucide-react";

export default function EventsPage() {
  const { appUser } = useAuth();

  // Allow both admin and user roles (only restrict devotees)
  if (!appUser || !["admin", "user"].includes(appUser.role)) {
    return (
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You need to be logged in to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events & SMS</h1>
          <p className="mt-2 text-gray-600">
            Manage events and send SMS notifications to donors
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Event Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Create and manage ashram events and festivals.
            </p>
            <div className="text-sm text-gray-500">
              Coming soon - Event creation and management interface
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span>SMS Broadcasting</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Send SMS notifications to donors about events and updates.
            </p>
            <div className="text-sm text-gray-500">
              Coming soon - SMS broadcasting system
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Donor Communication</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Manage communication preferences and contact lists.
            </p>
            <div className="text-sm text-gray-500">
              Coming soon - Communication management interface
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No Events Yet
            </h3>
            <p className="mb-4 text-gray-600">
              Create your first event to get started with event management and
              SMS notifications.
            </p>
            <Button
              variant="outline"
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Event
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
