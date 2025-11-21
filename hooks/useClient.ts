"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { apiClient } from "./useAuth";

export type Client = {
  id: number;
  name: string;
  email: string;
  contactNo: string;
  company: string;
  address: string;
};

export const useClient = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchClients = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * limit;
      const res = await apiClient.get("/api/client", {
        params: {
          limit,
          offset,
          search: search.trim(),
        },
        withCredentials: true,
      });
      const data = res.data;
      console.log(data);
      setClients(data.clients);
      setTotal(data.total);
    } catch (error: any) {
      setError(error);
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (data: Omit<Client, "id">) => {
    try {
      await apiClient.post("/api/client", data, {
        withCredentials: true,
      });
      await fetchClients();
    } catch (error) {
      console.error("Error adding client:", error);
      throw error;
    }
  };

  const deleteClient = async (id: number) => {
    try {
      await apiClient.get(`/api/client?id=${id}`, {
        withCredentials: true,
      });
      await fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  };

  return { clients, loading, error, addClient, deleteClient, fetchClients, total };
};
