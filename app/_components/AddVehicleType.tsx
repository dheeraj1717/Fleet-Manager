"use client";

import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { RefObject, useRef } from "react";
import { useOnclickOutside } from "../hooks/useOnclickOutside";
export type VehicleTypeFormData = {
  name: string;
  description: string;
}
type AddVehicleTypeProps = {
  setIsAddVehicleTypeModal: (isOpen: boolean) => void;
  addVehicleType: (data: VehicleTypeFormData) => Promise<void>;
  fetchVehicleTypes: () => Promise<void>;
};

const AddVehicleType = ({
  setIsAddVehicleTypeModal,
  addVehicleType,
  fetchVehicleTypes,
}: AddVehicleTypeProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VehicleTypeFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const modalRef = useRef<HTMLDivElement>(null);

  const onSubmit = async (data: VehicleTypeFormData) => {
    try {
      await addVehicleType(data);
      await fetchVehicleTypes();
      console.log("Vehicle type added successfully");
      reset();
      setIsAddVehicleTypeModal(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useOnclickOutside(modalRef as RefObject<HTMLDivElement>, () =>
    setIsAddVehicleTypeModal(false)
  );

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
      >
        <button
          onClick={() => setIsAddVehicleTypeModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          type="button"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-6">Add Vehicle Type</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vehicle Type Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register("name", {
                required: "Vehicle type name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Heavy Truck"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 resize-none"
              placeholder="e.g., 10-ton capacity trucks for heavy cargo transport"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAddVehicleTypeModal(false)}
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
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleType;
