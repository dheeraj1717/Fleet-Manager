"use client";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { forwardRef } from "react";
import useNotification from "@/hooks/useNotification";

interface EditClientProps {
  setIsModalOpen: (open: boolean) => void;
  updateClient: (id: string, data: any) => Promise<void>;
  fetchClients: () => void;
  client: any;
}

const EditClient = forwardRef<HTMLDivElement, EditClientProps>(
  ({ setIsModalOpen, updateClient, fetchClients, client }, ref) => {
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm({
      defaultValues: {
        name: client.name,
        email: client.email || "",
        contactNo: client.contactNo,
        company: client.company || "",
        address: client.address,
      },
    });
    const {triggerNotification, NotificationComponent} = useNotification();

    const onSubmit = async (data: any) => {
      try {
        await updateClient(client.id, data);
        await fetchClients();
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to update client:", error);
        triggerNotification({ message: "Something went wrong!", type: "error" });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          ref={ref}
          className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Edit Client</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter client name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.name.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("contactNo", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit contact number",
                  },
                })}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactNo ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter contact number"
                maxLength={10}
              />
              {errors.contactNo && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.contactNo.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.email.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                {...register("company")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("address", { required: "Address is required" })}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter address"
                rows={3}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.address.message)}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Client"}
              </button>
            </div>
          </form>
        </div>
        {NotificationComponent}
      </div>
    );
  }
);

EditClient.displayName = "EditClient";

export default EditClient;