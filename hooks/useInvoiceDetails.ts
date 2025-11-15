"use client";
import { useState, useEffect } from "react";
import useAuth from "./useAuth";

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: {
    id: string;
    name: string;
    email?: string;
    contactNo: string;
    company?: string;
    address: string;
  };
  startDate: string;
  endDate: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
  jobs: any[];
  payments?: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    referenceNo?: string;
    paymentDate: string;
    notes?: string;
  }>;
}

export default function useInvoiceDetails(invoiceId: string) {
  const { apiClient } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/invoices/${invoiceId}`);
      setInvoice(response.data.data || response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load invoice");
      console.error("Error fetching invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const refetch = () => {
    fetchInvoice();
  };

  return {
    invoice,
    loading,
    error,
    refetch,
  };
}