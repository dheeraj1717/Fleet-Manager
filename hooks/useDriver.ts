import axios from "axios";
import { useEffect, useState } from "react";
import { DriverFormData } from "../components/AddDriver";
import { apiClient } from "./useAuth";

export type Driver = {
  id: number;
  name: string;
  address: string;
  contactNo: string;
  licenseNo: string;
  joiningDate: string;
};

export const useDriver = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchDrivers = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * limit;
      const res = await apiClient.get("/api/drivers", {
        params: {
          limit,
          offset,
          search: search.trim(),
        },
        withCredentials: true,
      });
      const data = res.data;
      setDrivers(data.drivers);
      setTotal(data.totalCount);
    } catch (error: any) {
      setError(error);
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const addDriver = async (data: DriverFormData) => {
    try {
      await apiClient.post("/api/drivers", data, {
        withCredentials: true,
      });
      await fetchDrivers();
    } catch (error: any) {
      console.error("Error adding driver:", error);
    }
  };

  const deleteDriver = async (id: number) => {
    try {
      await apiClient.get(`/api/drivers?id=${id}`, {
        withCredentials: true,
      });
      await fetchDrivers();
    } catch (error: any) {
      console.error("Error deleting driver:", error);
    }
  };
  
  return {
    drivers,
    loading,
    error,
    addDriver,
    deleteDriver,
    total,
    fetchDrivers,
  };
};
