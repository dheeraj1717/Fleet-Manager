import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { forwardRef } from "react";
import { useVehicle } from "../hooks/useVehicle";

export type VehicleFormData = {
  model: string;
  registrationNo: string;
  vehicleTypeId: string;
  insuranceExpiry: Date | null;
};

type AddVehiclesProps = {
  setIsModalOpen: (isOpen: boolean) => void;
  vehicleTypes: Array<{ id: string; name: string; description?: string }>;
  fetchVehicles: () => Promise<void>;
};

const AddVehicles = forwardRef<HTMLDivElement, AddVehiclesProps>(
  ({ setIsModalOpen, vehicleTypes, fetchVehicles }, ref) => {
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
    } = useForm<VehicleFormData>({
      defaultValues: {
        model: "",
        registrationNo: "",
        vehicleTypeId: "",
        insuranceExpiry: null,
      },
    });

    const {addVechile} = useVehicle();

    const onSubmit = async (data: VehicleFormData) => {
      try {
        await addVechile(data);
        await fetchVehicles();
        setIsModalOpen(false);
        reset();
      } catch (error) {
        console.error("Error adding vehicle:", error);
      }
    };

    const onSubmitForm = async (data: VehicleFormData) => {
      try {
        await onSubmit(data);
        reset();
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <div 
          ref={ref}
          className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            type="button"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-semibold mb-6">Add New Vehicle</h2>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="model"
                {...register("model", {
                  required: "Model is required",
                  minLength: {
                    value: 2,
                    message: "Model must be at least 2 characters",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                  errors.model ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Tata LPT 1613"
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="registrationNo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="registrationNo"
                {...register("registrationNo", {
                  required: "Registration number is required",
                  pattern: {
                    value: /^[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}$/i,
                    message: "Invalid registration format (e.g., TN 01 AB 1234)",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                  errors.registrationNo ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., TN 01 AB 1234"
              />
              {errors.registrationNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.registrationNo.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="vehicleTypeId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicleTypeId"
                {...register("vehicleTypeId", {
                  required: "Vehicle type is required",
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                  errors.vehicleTypeId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a type</option>
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.vehicleTypeId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.vehicleTypeId.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="insuranceExpiry"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Insurance Expiry
              </label>
              <input
                type="date"
                id="insuranceExpiry"
                {...register("insuranceExpiry")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              />
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
                {isSubmitting ? "Adding..." : "Add Vehicle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

AddVehicles.displayName = "AddVehicles";

export default AddVehicles;