"use client";
import axios, { AxiosError } from "axios";
import { useState } from "react";

export interface LoginData {
  contactNo: string;
  password: string;
}

// Create axios instance with interceptor for auto-refresh
export const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
});

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor to handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Don't retry refresh endpoint itself or if already retried
    if (
      originalRequest.url?.includes('/api/auth/refresh') ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // If error is 401, try to refresh
    if (error.response?.status === 401) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post('/api/auth/refresh');
        processQueue();
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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

  return { login, logout, loading, error };
}