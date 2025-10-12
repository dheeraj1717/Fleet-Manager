"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";

export interface LoginData {
  contactNo: string;
  password: string;
}

// Create axios instance with interceptor for auto-refresh
const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
});

// Response interceptor to handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await axios.post(
          `/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post("/api/auth/login", data);
      console.log(res.data);
      return res.data;
    } catch (error: any) {
      setError(error);
      console.error("Error logging in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/api/auth/logout");
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error: any) {
      setError(error);
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  return { login, logout, loading, error, apiClient };
}
