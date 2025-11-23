"use client";
import { useEffect, useState } from "react";
import { apiClient } from "./useAuth";

export interface AnalyticsData {
  overview: {
    clients: { total: number; active: number };
    drivers: { total: number; active: number };
    vehicles: { total: number; active: number };
  };
  jobs: {
    total: number;
    completed: number;
    pending: number;
    inPeriod: number;
  };
  financial: {
    totalRevenue: number;
    revenueInPeriod: number;
    totalOutstanding: number;
    pendingInvoices: number;
    overdueInvoices: number;
  };
  charts: {
    monthlyRevenue: Array<{ month: string; revenue: number; job_count: number }>;
    topClients: Array<{
      name: string;
      company?: string;
      total_revenue: number;
      job_count: number;
    }>;
    vehicleUsage: Array<{
      registrationNo: string;
      vehicle_type: string;
      job_count: number;
      total_revenue: number;
    }>;
  };
  recentActivity: {
    jobs: any[];
    invoices: any[];
    payments: any[];
  };
  alerts: {
    expiringInsurance: any[];
    overdueInvoices: number;
  };
}

export function useAnalytics(period: number = 30) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/api/analytics?period=${period}`, {
          withCredentials: true,
        });
        setData(response.data.data || response.data);
      } catch (err: any) {
        setError(err);
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  return { data, loading, error };
}