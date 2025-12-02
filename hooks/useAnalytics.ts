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
        const [overviewRes, chartsRes, recentRes, alertsRes] = await Promise.all([
          apiClient.get(`/api/stats/overview?period=${period}`, {
            withCredentials: true,
          }),
          apiClient.get(`/api/stats/charts?period=${period}`, {
            withCredentials: true,
          }),
          apiClient.get(`/api/stats/recent?period=${period}`, {
            withCredentials: true,
          }),
          apiClient.get(`/api/stats/alerts?period=${period}`, {
            withCredentials: true,
          }),
        ]);

        const overviewData = overviewRes.data.data || overviewRes.data;
        const chartsData = chartsRes.data.data || chartsRes.data;
        const recentData = recentRes.data.data || recentRes.data;
        const alertsData = alertsRes.data.data || alertsRes.data;

        setData({
          ...overviewData,
          charts: chartsData,
          recentActivity: recentData,
          alerts: alertsData,
        });
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