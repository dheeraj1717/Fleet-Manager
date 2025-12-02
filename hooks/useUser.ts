"use client";
import { useEffect, useState } from "react";
import { apiClient } from "./useAuth";

interface User {
  id: string;
  name: string;
  email?: string;
  companyName: string;
  contactNo: string;
  address: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await apiClient.get("/api/user/me", {
        withCredentials: true,
      });
      console.log(res.data);
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, refreshUser: fetchUser };
};