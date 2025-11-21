"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { VehicleFormData } from "../components/AddVehicles";
import { apiClient } from "./useAuth";

export interface Vehicle {
  id: string;
  model: string;
  registrationNo: string;
  vehicleType: string;
  vehicleTypeId: string;
  insuranceExpiry: string | null;
}

export const useVehicle = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchVehicles = async (
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ) => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * limit;
      const res = await apiClient.get(`/api/vehicle`, {
        params: { offset, limit, search: search.trim() },
        withCredentials: true,
      });
      const data = res.data;
      console.log(data)
      setVehicles(data.vehicles);
      setTotal(data.total || 0);
    } catch (error: any) {
      setError(error);
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (data: VehicleFormData) => {
    try {
      await apiClient.post(`/api/vehicle`, data, { withCredentials: true });
      await fetchVehicles();
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
    }
  };

  return { vehicles, loading, error, total, fetchVehicles, addVehicle };
};
