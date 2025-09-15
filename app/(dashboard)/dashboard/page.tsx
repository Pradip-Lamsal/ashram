"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLoading } from "@/components/ui/loading";
import { dashboardService } from "@/lib/supabase-services";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  IndianRupee,
  Receipt,
  Smartphone,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

// Lazy load Recharts components
const ResponsiveContainer = dynamic(
  () =>
    import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
    ),
  }
);

const LineChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.LineChart })),
  {
    ssr: false,
  }
);

const PieChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.PieChart })),
  {
    ssr: false,
  }
);

const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.CartesianGrid })),
  {
    ssr: false,
  }
);

const XAxis = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.XAxis })),
  {
    ssr: false,
  }
);

const YAxis = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.YAxis })),
  {
    ssr: false,
  }
);

const Tooltip = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Tooltip })),
  {
    ssr: false,
  }
);

const Line = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Line })),
  {
    ssr: false,
  }
);

const Pie = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Pie })),
  {
    ssr: false,
  }
);

const Cell = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Cell })),
  {
    ssr: false,
  }
);

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    totalDonations: number;
    totalAmount: number;
    onlinePayments: number;
    offlinePayments: number;
    qrPayments: number;
    topDonors: Array<{ id: string; name: string; amount: number }>;
    recentDonations: Array<{
      id: string;
      receipt_number: string;
      amount: number;
      donor_name: string;
      created_at: string;
    }>;
    upcomingEvents: Array<{ id: string; name: string; date: Date }>;
  }>({
    totalDonations: 0,
    totalAmount: 0,
    onlinePayments: 0,
    offlinePayments: 0,
    qrPayments: 0,
    topDonors: [],
    recentDonations: [],
    upcomingEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [yearlyData] = useState([
    { name: "Jan 2025", amount: 0, donations: 0 },
    { name: "Feb 2025", amount: 0, donations: 0 },
    { name: "Mar 2025", amount: 0, donations: 0 },
    { name: "Apr 2025", amount: 0, donations: 0 },
    { name: "May 2025", amount: 0, donations: 0 },
    { name: "Jun 2025", amount: 0, donations: 0 },
    { name: "Jul 2025", amount: 0, donations: 0 },
    { name: "Aug 2025", amount: 0, donations: 0 },
    { name: "Sep 2025", amount: 0, donations: 0 },
  ]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statsCards = useMemo(
    () => [
      {
        title: "Total Donations",
        value: loading ? "..." : stats.totalDonations,
        icon: Receipt,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "Total Amount",
        value: loading ? "..." : formatCurrency(stats.totalAmount),
        icon: IndianRupee,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        title: "Online Payments",
        value: loading ? "..." : stats.onlinePayments,
        icon: CreditCard,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      {
        title: "QR Payments",
        value: loading ? "..." : stats.qrPayments,
        icon: Smartphone,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
    ],
    [loading, stats]
  );

  const paymentModeData = [
    {
      name: "Online",
      value: stats.onlinePayments,
      color: "#8b5cf6",
    },
    {
      name: "Offline",
      value: stats.offlinePayments,
      color: "#10b981",
    },
    {
      name: "QR Payment",
      value: stats.qrPayments,
      color: "#f59e0b",
    },
  ];

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="px-6 py-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Ashram Management System
        </p>
      </div>{" "}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
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
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        {/* Yearly Donations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Yearly Donations Trend</CardTitle>
            <CardDescription>
              Donation trends over the past months (2025)
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
            <div className="flex justify-center mt-4 space-x-4">
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Donors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Donors</CardTitle>
            <CardDescription>Most generous contributors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topDonors.length > 0 ? (
                stats.topDonors.map((donor, index) => (
                  <div
                    key={donor.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-orange-700 bg-orange-100 rounded-full">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {donor.name}
                        </p>
                        <p className="text-sm text-gray-500">Total Donations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(donor.amount)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No donors yet</p>
                  <p className="text-sm">
                    Start by adding donors and donations
                  </p>
                </div>
              )}
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
              {stats.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50"
                >
                  <div className="p-2 text-blue-700 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5" />
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
