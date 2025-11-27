"use client";
import { useEffect, useState } from "react";
import { Job } from "./useJobs";
import { apiClient } from "./useAuth";

export interface Client {
  id: string;
  name: string;
  email?: string;
  contactNo: string;
  company?: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useClientJobs(
  clientId: string | string[] | undefined,
  page: number = 1,
  limit: number = 10
) {
  const [client, setClient] = useState<Client | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const fetchClientAndJobs = async ( page = 1, limit = 10) => {
    if (!clientId || typeof clientId !== "string") {
      setError("Invalid client ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get(
        `/api/client/${clientId}?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );

      setClient(res.data.client);
      setJobs(res.data.jobs);
      setTotal(res.data.totalJobs);
      setTotalAmount(res.data.totalAmount);
      setTotalHours(res.data.totalHours);
    } catch (err: any) {
      console.error("Error fetching client & jobs:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientAndJobs();
  }, [clientId, page, limit]);

  return {
    client,
    jobs,
    total,
    loading,
    error,
    fetchClientAndJobs,
    refetch: fetchClientAndJobs,
    totalAmount,
    totalHours
  };
}
