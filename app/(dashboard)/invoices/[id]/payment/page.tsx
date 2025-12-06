"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { apiClient } from "@/hooks/useAuth";
import useNotification from "@/hooks/useNotification";

interface PaymentForm {
  amount: number;
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
  referenceNo?: string;
  paymentDate: string;
  notes?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: {
    id: string;
    name: string;
    company?: string;
  };
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
}

const AddPayment = () => {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const {triggerNotification, NotificationComponent} = useNotification();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentForm>({
    defaultValues: {
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "CASH",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const amount = watch("amount");

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/invoices/${params.id}`, {
        withCredentials: true,
      });
      const invoiceData = response.data.data || response.data;
      setInvoice(invoiceData);

      // Set default amount to balance amount
      setValue("amount", invoiceData.balanceAmount);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      alert("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PaymentForm) => {
    if (!invoice) return;

    if (data.amount > invoice.balanceAmount) {
      alert("Payment amount cannot exceed balance amount");
      return;
    }

    if (data.amount <= 0) {
      alert("Payment amount must be greater than zero");
      return;
    }

    try {
      const payload = {
        invoiceId: invoice.id,
        clientId: invoice.client.id,
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod,
        referenceNo: data.referenceNo || null,
        paymentDate: data.paymentDate,
        notes: data.notes || null,
      };



      await apiClient.post("/api/payments", payload, {
        withCredentials: true,
      });

      alert("Payment recorded successfully!");
      router.push(`/invoices/${invoice.id}`);
    } catch (error: any) {
      console.error("Payment error:", error);
      triggerNotification({ message: error.message || "Something went wrong", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-20">Loading...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8">
        <div className="text-center py-20 text-red-500">Invoice not found</div>
      </div>
    );
  }

  const remainingAfterPayment = invoice.balanceAmount - (Number(amount) || 0);

  return (
    <div className="p-2 sm:p-4 md:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
      >
        <ArrowLeft size={20} />
        Back to Invoice
      </button>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 sm:p-4 md:p-8">
        <h1 className="text-xl sm:text-3xl font-semibold pb-3 sm:mb-6 text-center sm:text-left">
          Record Payment
        </h1>

        {/* Invoice Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <div>
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="text-lg font-semibold">
                  {invoice.client.name}
                  {invoice.client.company && ` (${invoice.client.company})`}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-lg font-semibold">
                ₹{invoice.totalAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Already Paid</p>
              <p className="text-lg font-semibold text-green-600">
                ₹{invoice.paidAmount.toLocaleString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Balance Due</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{invoice.balanceAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
                max: {
                  value: invoice.balanceAmount,
                  message: "Amount cannot exceed balance",
                },
              })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                errors.amount ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter payment amount"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.amount.message}
              </p>
            )}
            {amount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Remaining balance after this payment: ₹
                {remainingAfterPayment.toFixed(2)}
              </p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setValue("amount", invoice.balanceAmount / 2)}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Half (₹{(invoice.balanceAmount / 2).toFixed(2)})
            </button>
            <button
              type="button"
              onClick={() => setValue("amount", invoice.balanceAmount)}
              className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              Full Payment (₹{invoice.balanceAmount.toFixed(2)})
            </button>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              {...register("paymentMethod", {
                required: "Payment method is required",
              })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                errors.paymentMethod ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
            </select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          {/* Reference Number (conditional) */}
          {["UPI", "BANK_TRANSFER", "CHEQUE"].includes(paymentMethod) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
                {paymentMethod === "CHEQUE" && (
                  <span className="text-gray-500"> (Cheque Number)</span>
                )}
                {paymentMethod === "UPI" && (
                  <span className="text-gray-500"> (Transaction ID)</span>
                )}
              </label>
              <input
                type="text"
                {...register("referenceNo")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                placeholder={
                  paymentMethod === "CHEQUE"
                    ? "Enter cheque number"
                    : paymentMethod === "UPI"
                    ? "Enter UPI transaction ID"
                    : "Enter reference number"
                }
              />
            </div>
          )}

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("paymentDate", {
                required: "Payment date is required",
              })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                errors.paymentDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.paymentDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.paymentDate.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              {...register("notes")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Add any additional notes about this payment..."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
      {NotificationComponent}
    </div>
  );
};

export default AddPayment;
