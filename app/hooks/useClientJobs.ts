"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Job } from "./useJobs";

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
  jobs?: Job[];
}

export function useClientJobs(clientId: string | string[] | undefined) {
  const [client, setClient] = useState<Client | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientAndJobs = async () => {
    if (!clientId || typeof clientId !== 'string') {
      setError("Invalid client ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const clientResponse = await axios.get(`/api/client/${clientId}`, {
        withCredentials: true,
      });
      
      const clientData = clientResponse.data;
      console.log("clientData", clientData);
      setClient(clientData);
      setJobs(clientData.jobs || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
      console.error("Error fetching client and jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientAndJobs();
  }, [clientId]);

  return { client, jobs, loading, error, refetch: fetchClientAndJobs };
}