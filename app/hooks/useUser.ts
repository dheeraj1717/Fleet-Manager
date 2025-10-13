"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { getUserFromToken } from "@/lib/getUserFromToken";

interface User {
  id: string;
  name: string;
  email?: string;
  companyName: string;
  contactNo: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/user/me", {
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

    fetchUser();
  }, []);

  return { user, loading };
};