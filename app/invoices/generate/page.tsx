"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useClient } from "@/app/hooks/useClient";

interface Client {
  id: string;
  name: string;
  company?: string;
}

interface GenerateInvoiceForm {
  clientId: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

const GenerateInvoice = () => {
  const router = useRouter();
  const [unbilledJobs, setUnbilledJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { clients } = useClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GenerateInvoiceForm>();

  const clientId = watch("clientId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    if (clientId && startDate && endDate) {
      fetchUnbilledJobs();
    }
  }, [clientId, startDate, endDate]);

  const fetchUnbilledJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/jobs?clientId=${clientId}&invoiceId=null&startDate=${startDate}&endDate=${endDate}&status=COMPLETED`,
        { withCredentials: true }
      );
      setUnbilledJobs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching unbilled jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: GenerateInvoiceForm) => {
    try {
      const response = await axios.post("/api/invoices/generate", data, {
        withCredentials: true,
      });
      router.push(`/invoices/${response.data.data.id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to generate invoice");
    }
  };

  const totalAmount = unbilledJobs.reduce(
    (sum, job) => sum + (job.amount || 0),
    0
  );
  const cgst = totalAmount * 0.09;
  const sgst = totalAmount * 0.09;
  const grandTotal = totalAmount + cgst + sgst;

  // Quick date range helpers
  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startInput = document.querySelector<HTMLInputElement>(
      'input[name="startDate"]'
    );
    const endInput = document.querySelector<HTMLInputElement>(
      'input[name="endDate"]'
    );

    if (startInput && endInput) {
      startInput.value = firstDay.toISOString().split("T")[0];
      endInput.value = lastDay.toISOString().split("T")[0];
      startInput.dispatchEvent(new Event("input", { bubbles: true }));
      endInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const setLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

    const startInput = document.querySelector<HTMLInputElement>(
      'input[name="startDate"]'
    );
    const endInput = document.querySelector<HTMLInputElement>(
      'input[name="endDate"]'
    );

    if (startInput && endInput) {
      startInput.value = firstDay.toISOString().split("T")[0];
      endInput.value = lastDay.toISOString().split("T")[0];
      startInput.dispatchEvent(new Event("input", { bubbles: true }));
      endInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-3xl font-semibold mb-6">Generate Invoice</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                {...register("clientId", { required: "Client is required" })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                  errors.clientId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.clientId.message}
                </p>
              )}
            </div>

            {/* Quick Date Selection */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={setCurrentMonth}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Calendar size={14} className="inline mr-1" />
                Current Month
              </button>
              <button
                type="button"
                onClick={setLastMonth}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Calendar size={14} className="inline mr-1" />
                Last Month
              </button>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.startDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("endDate", { required: "End date is required" })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                {...register("notes")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || unbilledJobs.length === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Generating..." : "Generate Invoice"}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading jobs...
            </div>
          ) : unbilledJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No unbilled jobs found for the selected period.
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>{unbilledJobs.length}</strong> unbilled job(s) will be
                  included
                </p>
              </div>

              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {unbilledJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div className="text-sm">
                      <p className="font-medium">
                        {new Date(job.date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 text-xs">{job.location}</p>
                    </div>
                    <p className="font-semibold">
                      ₹{job.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>CGST (9%):</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>SGST (9%):</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoice;
