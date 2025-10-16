"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { VehicleFormData } from "../_components/AddVehicles";

interface Vehicle {
  id: string;
  model: string;
  registrationNo: string;
  vehicleType: string;
  vehicleTypeId: string;
  insuranceExpiry: string | null;
}

export const useVehicle = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/vehicle`, {
        withCredentials: true,
      });
      const data = res.data;
      console.log(data);
      setVehicles(data);
    } catch (error: any) {
      setError(error);
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  },[])
  const addVechile = async (data: VehicleFormData) => {
    try {
      await axios.post(`/api/vehicle`, data, {
        withCredentials: true,
      });
      await fetchVehicles();
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
    }
  };
  
  return { vehicles, loading, error, fetchVehicles, addVechile };
};
