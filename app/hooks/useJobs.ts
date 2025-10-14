"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export interface Job {
  id: string;
  clientId: string;
  driverId: string;
  vehicleId: string;
  vehicleTypeId: string;
  location: string;
  date: string;
  startTime: string;
  endTime?: string;
  totalHours?: number;
  ratePerHour: number;
  amount: number;
  status: string;
  notes?: string;
  // Include relations for display
  client?: {
    name: string;
  };
  driver?: {
    name: string;
  };
  vehicle?: {
    registrationNo: string;
    vehicleType: {
      name: string;
    };
  };
  vehicleType?: {
    name: string;
  };
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/job", {
        withCredentials: true,
      });
      const data = res.data;
      console.log(data);
      setJobs(data);
    } catch (error: any) {
      setError(error);
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const addJob = async (data: Omit<Job, "id">) => {
    try {
      await axios.post("/api/job", data, {
        withCredentials: true,
      });
      await fetchJobs();
    } catch (error: any) {
      console.error("Error adding job:", error);
      throw error;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await axios.delete(`/api/job/${id}`, {
        withCredentials: true,
      });
      await fetchJobs();
    } catch (error: any) {
      console.error("Error deleting job:", error);
      throw error;
    }
  };

  return { jobs, loading, error, addJob, deleteJob, fetchJobs };
};