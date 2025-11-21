import axios from "axios";
import { useEffect, useState } from "react";
import { apiClient } from "./useAuth";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: {
    id: string;
    name: string;
    company?: string;
  };
  startDate: string;
  endDate: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  createdAt: string;
  _count: {
    jobs: number;
    payments: number;
  };
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);

  const fetchInvoices = async (page = 1, limit = 10, search = "", filter = "all") => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * limit;
      const response = await apiClient.get(`/api/invoices`, {
        params: {
          limit,
          offset,
          search: search.trim(),
          status: filter,
        },
      });
      const data = response.data;
      setInvoices(data.invoices || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  return { invoices, loading, filter, setFilter, total, fetchInvoices };
};
