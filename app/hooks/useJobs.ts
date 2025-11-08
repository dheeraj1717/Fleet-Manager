"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export const useJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchJobs = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * limit;
      const res = await axios.get("/api/jobs", {
        params: { limit, offset, search },
        withCredentials: true,
      });
      const { jobs, total } = res.data;
      setJobs(jobs);
      setTotal(total);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (jobData: any) => {
    await axios.post("/api/jobs", jobData, { withCredentials: true });
    await fetchJobs();
  };

  const deleteJob = async (id: string) => {
    await axios.delete(`/api/jobs?id=${id}`, { withCredentials: true });
    await fetchJobs();
  };

  return { jobs, total, loading, error, fetchJobs, addJob, deleteJob };
};
