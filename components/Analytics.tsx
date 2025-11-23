"use client";
import { useState } from "react";
import {
  Users,
  Truck,
  UserCheck,
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Calendar,
  FileText,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "../hooks/useAnalytics";

export default function Analytics() {
  const [period, setPeriod] = useState(30);
  const { data, loading, error } = useAnalytics(period);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p>Failed to load analytics</p>
        </div>
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    onClick,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-2 sm:p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your fleet.
          </p>
        </div>

        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 max-w-[250px] mt-4 sm:mt-0 cursor-pointer"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Alerts */}
      {(data.alerts.expiringInsurance.length > 0 ||
        data.alerts.overdueInvoices > 0) && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">
                Attention Required
              </h3>
              <div className="mt-2 space-y-1 text-sm text-yellow-800">
                {data.alerts.expiringInsurance.length > 0 && (
                  <p>
                    • {data.alerts.expiringInsurance.length} vehicle(s) have
                    insurance expiring in the next 30 days
                  </p>
                )}
                {data.alerts.overdueInvoices > 0 && (
                  <p>• {data.alerts.overdueInvoices} overdue invoice(s)</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Clients"
          value={data.overview.clients.total}
          subtitle={`${data.overview.clients.active} active`}
          icon={Users}
          color="bg-blue-500"
          onClick={() => router.push("/clients")}
        />
        <StatCard
          title="Total Drivers"
          value={data.overview.drivers.total}
          subtitle={`${data.overview.drivers.active} active`}
          icon={UserCheck}
          color="bg-green-500"
          onClick={() => router.push("/drivers")}
        />
        <StatCard
          title="Total Vehicles"
          value={data.overview.vehicles.total}
          subtitle={`${data.overview.vehicles.active} active`}
          icon={Truck}
          color="bg-purple-500"
          onClick={() => router.push("/vehicles")}
        />
        <StatCard
          title="Total Jobs"
          value={data.jobs.total}
          subtitle={`${data.jobs.completed} completed`}
          icon={Briefcase}
          color="bg-orange-500"
          onClick={() => router.push("/jobs")}
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${data.financial.totalRevenue.toLocaleString()}`}
          subtitle="All time"
          icon={TrendingUp}
          color="bg-green-600"
        />
        <StatCard
          title={`Revenue (Last ${period} days)`}
          value={`₹${data.financial.revenueInPeriod.toLocaleString()}`}
          subtitle={`${data.jobs.inPeriod} jobs`}
          icon={DollarSign}
          color="bg-blue-600"
        />
        <StatCard
          title="Outstanding"
          value={`₹${data.financial.totalOutstanding.toLocaleString()}`}
          subtitle={`${data.financial.pendingInvoices} pending invoices`}
          icon={FileText}
          color="bg-orange-600"
          onClick={() => router.push("/invoices")}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Revenue Trend
          </h3>
          <div className="space-y-3">
            {data.charts.monthlyRevenue.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {item.job_count} jobs
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{parseFloat(item.revenue).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Clients by Revenue
          </h3>
          <div className="space-y-3">
            {data.charts.topClients.map((client: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  {client.company && (
                    <p className="text-xs text-gray-500">{client.company}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {client.job_count} jobs
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  ₹{parseFloat(client.total_revenue).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Usage */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Performing Vehicles
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Vehicle
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Type
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Jobs
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {data.charts.vehicleUsage.map((vehicle: any, index: number) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {vehicle.registrationNo}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {vehicle.vehicle_type}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    {vehicle.job_count}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-600 text-right">
                    ₹{parseFloat(vehicle.total_revenue || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Jobs
          </h3>
          <div className="space-y-3">
            {data.recentActivity.jobs.slice(0, 5).map((job: any) => (
              <div
                key={job.id}
                className="flex items-start justify-between pb-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {job.client.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(job.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ₹{job.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Invoices
          </h3>
          <div className="space-y-3">
            {data.recentActivity.invoices.slice(0, 5).map((invoice: any) => (
              <div
                key={invoice.id}
                className="flex items-start justify-between pb-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {invoice.client.name} • {invoice._count.jobs} jobs
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === "PAID"
                      ? "bg-green-100 text-green-800"
                      : invoice.status === "PARTIAL"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Payments
          </h3>
          <div className="space-y-3">
            {data.recentActivity.payments.slice(0, 5).map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-start justify-between pb-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.client.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(payment.paymentDate).toLocaleDateString()} •{" "}
                    {payment.paymentMethod}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  ₹{payment.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}