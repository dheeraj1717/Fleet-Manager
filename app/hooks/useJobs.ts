"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export interface Job {
  id: string;
  jobNumber: string;
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
  invoiceId?: string;
  challanNo : string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Include relations for display
  client?: {
    id: string;
    name: string;
    email?: string;
    contactNo: string;
    company?: string;
  };
  driver?: {
    id: string;
    name: string;
    contactNo: string;
    licenseNo: string;
  };
  vehicle?: {
    id: string;
    registrationNo: string;
    model?: string;
    vehicleType: {
      id: string;
      name: string;
    };
  };
  vehicleType?: {
    id: string;
    name: string;
  };
}

export type CreateJobData = {
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
  status?: string;
  notes?: string;
  challanNo : string;
};

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/jobs", {
        withCredentials: true,
      });
      const data = res.data;
      console.log("jobs",data);
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

  const addJob = async (jobData: CreateJobData) => {
    try {
      await axios.post("/api/jobs", jobData, {
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
      await axios.delete(`/api/jobs?id=${id}`, {
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