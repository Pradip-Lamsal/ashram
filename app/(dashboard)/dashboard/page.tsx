"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockDashboardStats } from "@/data/mockData";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  IndianRupee,
  Receipt,
  Smartphone,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const statsCards = [
  {
    title: "Total Donations",
    value: mockDashboardStats.totalDonations,
    icon: Receipt,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Total Amount",
    value: formatCurrency(mockDashboardStats.totalAmount),
    icon: IndianRupee,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Online Payments",
    value: mockDashboardStats.onlinePayments,
    icon: CreditCard,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "QR Payments",
    value: mockDashboardStats.qrPayments,
    icon: Smartphone,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

const paymentModeData = [
  {
    name: "Online",
    value: mockDashboardStats.onlinePayments,
    color: "#8b5cf6",
  },
  {
    name: "Offline",
    value: mockDashboardStats.offlinePayments,
    color: "#10b981",
  },
  {
    name: "QR Payment",
    value: mockDashboardStats.qrPayments,
    color: "#f59e0b",
  },
];

const yearlyData = [
  { name: "Jan 2024", amount: 45000, donations: 12 },
  { name: "Feb 2024", amount: 52000, donations: 15 },
  { name: "Mar 2024", amount: 48000, donations: 13 },
  { name: "Apr 2024", amount: 61000, donations: 18 },
  { name: "May 2024", amount: 55000, donations: 16 },
  { name: "Jun 2024", amount: 67000, donations: 19 },
  { name: "Jul 2024", amount: 72000, donations: 22 },
  { name: "Aug 2024", amount: 84000, donations: 25 },
  { name: "Sep 2024", amount: 78000, donations: 23 },
  { name: "Oct 2024", amount: 91000, donations: 28 },
  { name: "Nov 2024", amount: 96000, donations: 31 },
  { name: "Dec 2024", amount: 105000, donations: 35 },
];

export default function DashboardPage() {
  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to Ashram Management System
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Yearly Donations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Yearly Donations Trend</CardTitle>
            <CardDescription>
              Donation trends over the past 12 months (2024)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "amount" ? formatCurrency(Number(value)) : value,
                    name === "amount" ? "Amount" : "Donations",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="donations"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: "#8b5cf6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Mode Distribution</CardTitle>
            <CardDescription>How donors prefer to contribute</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentModeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {paymentModeData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Donors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Donors</CardTitle>
            <CardDescription>Most generous contributors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDashboardStats.topDonors.map((donor, index) => (
                <div
                  key={donor.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 text-orange-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{donor.name}</p>
                      <p className="text-sm text-gray-500">Total Donations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(donor.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled ashram events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDashboardStats.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.name}</p>
                    <p className="text-sm text-gray-500">
                      {event.date.toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
