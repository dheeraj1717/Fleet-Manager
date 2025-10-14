import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { forwardRef } from "react";

export type JobFormData = {
  clientId: string;
  driverId: string;
  vehicleId: string;
  vehicleTypeId: string;
  location: string;
  date: string;
  startTime: string;
  endTime?: string;
  ratePerHour: number;
  amount: number;
  status: string;
  notes?: string;
};

type AddJobProps = {
  setIsModalOpen: (isOpen: boolean) => void;
  addJob: (data: JobFormData) => Promise<void>;
  fetchJobs: () => Promise<void>;
  clients: Array<{ id: string; name: string }>;
  drivers: Array<{ id: string; name: string }>;
  vehicles: Array<{ id: string; registrationNo: string; model: string }>;
  vehicleTypes: Array<{ id: string; name: string }>;
};

const AddJob = forwardRef<HTMLDivElement, AddJobProps>(
  (
    {
      setIsModalOpen,
      addJob,
      fetchJobs,
      clients,
      drivers,
      vehicles,
      vehicleTypes,
    },
    ref
  ) => {
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
      watch,
    } = useForm<JobFormData>({
      defaultValues: {
        clientId: "",
        driverId: "",
        vehicleId: "",
        vehicleTypeId: "",
        location: "",
        date: "",
        startTime: "",
        endTime: "",
        ratePerHour: 0,
        amount: 0,
        status: "COMPLETED",
        notes: "",
      },
    });

    const onSubmit = async (data: JobFormData) => {
      try {
        await addJob(data);
        await fetchJobs();
        setIsModalOpen(false);
        reset();
      } catch (error) {
        console.error("Error adding job:", error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <div
          ref={ref}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            type="button"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-semibold mb-6">Add New Job</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: Client and Driver */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="clientId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  id="clientId"
                  {...register("clientId", {
                    required: "Client is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.clientId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.clientId.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="driverId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Driver <span className="text-red-500">*</span>
                </label>
                <select
                  id="driverId"
                  {...register("driverId", {
                    required: "Driver is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.driverId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
                {errors.driverId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.driverId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Vehicle and Vehicle Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="vehicleId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  id="vehicleId"
                  {...register("vehicleId", {
                    required: "Vehicle is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.vehicleId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNo} - {vehicle.model}
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.vehicleId.message}
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
                  <option value="">Select type</option>
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
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                {...register("location", {
                  required: "Location is required",
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Construction Site, Gomti Nagar"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Row 3: Date and Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  {...register("date", {
                    required: "Date is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  {...register("startTime", {
                    required: "Start time is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.startTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  {...register("endTime")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Row 4: Rate and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ratePerHour"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rate Per Hour (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="ratePerHour"
                  {...register("ratePerHour", {
                    required: "Rate per hour is required",
                    min: { value: 0, message: "Rate must be positive" },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.ratePerHour ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 500"
                />
                {errors.ratePerHour && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ratePerHour.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 0, message: "Amount must be positive" },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 4000"
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                {...register("status")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              >
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="notes"
                {...register("notes")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                placeholder="Additional notes about the job..."
                rows={3}
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
                {isSubmitting ? "Adding..." : "Add Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

AddJob.displayName = "AddJob";

export default AddJob;