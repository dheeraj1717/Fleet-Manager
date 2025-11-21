"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { VehicleTypeFormData } from "../components/AddVehicleType";
import { apiClient } from "./useAuth";

interface VehicleType {
  id: string;
  name: string;
  description: string;
}

export const useVehicleType = () => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVehicleTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/api/vehicle-types`,
        {
          withCredentials: true,
        }
      );

      const data = res.data;
      console.log(data);
      setVehicleTypes(data);
    } catch (error: any) {
      setError(error);
      console.error("Error fetching vehicle types:", error);
    } finally {
      setLoading(false);
    }
  };

  const addVehicleType = async (vehicleType: VehicleTypeFormData) => {
    try {
     await apiClient.post(`/api/vehicle-types`, vehicleType, {
        withCredentials: true,
      });
      await fetchVehicleTypes();
    } catch (error: any) {
      console.error("Error adding vehicle type:", error);
    }
  };

  return { vehicleTypes, loading, error, fetchVehicleTypes, addVehicleType};
};