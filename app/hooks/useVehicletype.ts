"use client";

import axios from "axios";
import { useEffect, useState } from "react";

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
      const res = await axios.get(
        `${process.env.API_BASE}/api/vehicle-types`,
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

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  return { vehicleTypes, loading, error, fetchVehicleTypes };
};