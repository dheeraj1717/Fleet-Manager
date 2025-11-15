import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { forwardRef } from "react";

export type ClientFormData = {
  name: string;
  email: string;
  contactNo: string;
  company: string;
  address: string;
};

type AddClientProps = {
  setIsModalOpen: (isOpen: boolean) => void;
  addClient: (data: ClientFormData) => Promise<void>;
  fetchClients: () => Promise<void>;
};

const AddClient = forwardRef<HTMLDivElement, AddClientProps>(
  ({ setIsModalOpen, addClient, fetchClients }, ref) => {
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
    } = useForm<ClientFormData>({
      defaultValues: {
        name: "",
        email: "",
        contactNo: "",
        company: "",
        address: "",
      },
    });

    const onSubmit = async (data: ClientFormData) => {
      try {
        await addClient(data);
        await fetchClients();
        setIsModalOpen(false);
        reset();
      } catch (error) {
        console.error("Error adding client:", error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <div
          ref={ref}
          className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            type="button"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-semibold mb-6">Add New Client</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., ABC Corporation"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., contact@company.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="contactNo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contactNo"
                {...register("contactNo", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit contact number",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                  errors.contactNo ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., 9876543210"
                maxLength={10}
              />
              {errors.contactNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contactNo.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company
              </label>
              <input
                type="text"
                id="company"
                {...register("company")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                placeholder="e.g., Tech Solutions Pvt Ltd"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                {...register("address", {
                  required: "Address is required",
                  minLength: {
                    value: 10,
                    message: "Address must be at least 10 characters",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., 123 Business Park, Lucknow"
                rows={3}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Client"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

AddClient.displayName = "AddClient";

export default AddClient;