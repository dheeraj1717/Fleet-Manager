"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Fuel, History, Plus, BarChart3, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { apiClient } from "@/hooks/useAuth";
import useNotification from "@/hooks/useNotification";

interface FuelEntry {
  id: string;
  date: string;
  amount: number;
  liters: number;
}

interface FuelManagementModalProps {
  vehicle: {
    id: string;
    registrationNo: string;
    model?: string | null;
  };
  onClose: () => void;
}

const FuelManagementModal = ({ vehicle, onClose }: FuelManagementModalProps) => {
  const [activeTab, setActiveTab] = useState<"history" | "add">("history");
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { triggerNotification, NotificationComponent } = useNotification();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      liters: 0,
      amount: 0,
    },
  });

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/fuel?vehicleId=${vehicle.id}`);
      setEntries(res.data);
    } catch (error) {
      console.error("Error fetching fuel entries:", error);
      triggerNotification({
        message: "Failed to load fuel history",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [vehicle.id, triggerNotification]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const onSubmit = async (data: any) => {
    try {
      await apiClient.post("/api/fuel", {
        ...data,
        vehicleId: vehicle.id,
        liters: Number(data.liters),
        amount: Number(data.amount),
      });
      triggerNotification({
        message: "Fuel entry added successfully",
        type: "success",
      });
      reset();
      setActiveTab("history");
      fetchEntries();
    } catch (error) {
      console.error("Error adding fuel entry:", error);
      triggerNotification({
        message: "Failed to add fuel entry",
        type: "error",
      });
    }
  };

  // Stats calculation
  const totalLiters = entries.reduce((acc, curr) => acc + curr.liters, 0);
  const totalAmount = entries.reduce((acc, curr) => acc + curr.amount, 0);
  const avgPrice = totalLiters > 0 ? (totalAmount / totalLiters).toFixed(2) : "0.00";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-primary rounded-xl">
              <Fuel size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Fuel Management</h2>
              <p className="text-sm text-gray-500 font-medium">
                {vehicle.registrationNo} {vehicle.model ? `• ${vehicle.model}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-100">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Spent</p>
            <p className="text-xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Liters</p>
            <p className="text-xl font-bold text-gray-900">{totalLiters.toFixed(2)} L</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Avg ₹/Liter</p>
            <p className="text-xl font-bold text-blue-600">₹{avgPrice}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-100 bg-white">
          <button
            onClick={() => setActiveTab("history")}
            className={`py-4 px-4 flex items-center gap-2 text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === "history" 
                ? "text-primary" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <History size={16} />
            Fuel History
            {activeTab === "history" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`py-4 px-4 flex items-center gap-2 text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === "add" 
                ? "text-primary" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Plus size={16} />
            Add Entry
            {activeTab === "add" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-white">
          {activeTab === "history" ? (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading history...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <BarChart3 size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No fueling records found</p>
                  <button 
                    onClick={() => setActiveTab("add")}
                    className="mt-4 text-primary font-bold hover:underline cursor-pointer"
                  >
                    Add your first entry
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Liters</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="p-4 text-gray-700 font-medium">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-gray-700 font-bold">{entry.liters} L</td>
                          <td className="p-4 text-gray-900 font-bold text-right text-lg">
                            ₹{entry.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Date</label>
                <input
                  type="date"
                  {...register("date", { required: "Date is required" })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium text-sm cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Liters</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("liters", { 
                        required: "Liters are required",
                        min: { value: 0.1, message: "Must be positive" }
                      })}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-xl"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">L</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Amount (₹)</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("amount", { 
                        required: "Amount is required",
                        min: { value: 0, message: "Must be positive" }
                      })}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-xl"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className="flex-1 py-2 px-4 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-2 px-4 bg-primary text-white font-semibold rounded-lg shadow-md shadow-primary/20 hover:bg-primary/95 hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer text-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                       <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Adding...
                    </span>
                  ) : "Save Fuel Entry"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {NotificationComponent}
    </div>
  );
};

export default FuelManagementModal;
