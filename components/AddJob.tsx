import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { forwardRef, useEffect, useCallback } from "react";
import { CreateJobData, useJobs } from "../hooks/useJobs";
import useNotification from "@/hooks/useNotification";
import { useVehicle } from "@/hooks/useVehicle";
import { useDriver } from "@/hooks/useDriver";
import { useClient } from "@/hooks/useClient";

type AddJobProps = {
  setIsModalOpen: (isOpen: boolean) => void;
  defaultClientId?: string;
};

const AddJob = forwardRef<HTMLDivElement, AddJobProps>(
  (
    {
      setIsModalOpen,
      defaultClientId,
    },
    ref
  ) => {
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
      watch,
      setValue,
    } = useForm<CreateJobData>({
      defaultValues: {
        clientId: defaultClientId || "",
        driverId: "",
        vehicleId: "",
        vehicleTypeId: "",
        location: "",
        date: "",
        startTime: "",
        endTime: "",
        totalHours: 0,
        ratePerHour: 0,
        amount: 0,
        status: "COMPLETED",
        notes: "",
        challanNo: "",
      },
    });

    // Watch for changes in hours and rate to calculate amount
    const totalHours = watch("totalHours");
    const ratePerHour = watch("ratePerHour");
    const selectedVehicleId = watch("vehicleId");
    const { triggerNotification, NotificationComponent } = useNotification();
    const {vehicles, fetchAllVehicles} = useVehicle();
    const { addJob, fetchJobs } = useJobs();
    const {drivers, fetchAllDrivers} = useDriver();
    const {clients, fetchAllClients} = useClient();

    // Memoize fetch functions to prevent unnecessary re-renders
    const memoizedFetchClients = useCallback(fetchAllClients, []);
    const memoizedFetchDrivers = useCallback(fetchAllDrivers, []);
    const memoizedFetchVehicles = useCallback(fetchAllVehicles, []);

    useEffect(() => {
      if (defaultClientId) {
        setValue("clientId", defaultClientId);
      }
    }, [defaultClientId, setValue]);

    useEffect(() => {
      memoizedFetchClients();
      memoizedFetchDrivers();
      memoizedFetchVehicles();
    }, [memoizedFetchClients, memoizedFetchDrivers, memoizedFetchVehicles]);

    // Auto-calculate amount when hours or rate changes
    useEffect(() => {
      const hours = Number(totalHours) || 0;
      const rate = Number(ratePerHour) || 0;
      const calculatedAmount = hours * rate;
      setValue("amount", calculatedAmount);
    }, [totalHours, ratePerHour, setValue]);

    // Auto-fill vehicle type when vehicle is selected
    useEffect(() => {
      if (selectedVehicleId) {
        const selectedVehicle = vehicles.find(
          (v) => v.id === selectedVehicleId
        );
        if (selectedVehicle) {
          setValue("vehicleTypeId", selectedVehicle.vehicleTypeId!);
        }
      }
    }, [selectedVehicleId, vehicles, setValue]);

    const onSubmit = async (data: CreateJobData) => {
      try {
        const jobData: CreateJobData = {
          ...data,
          totalHours: Number(data.totalHours),
          ratePerHour: Number(data.ratePerHour),
          amount: Number(data.amount),
        };

        await addJob(jobData);
        await fetchJobs();
        setIsModalOpen(false);
        reset();
      } catch (error: any) {
        console.error("Error adding job:", error);

        const msg =
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong";

        triggerNotification({ message: msg, type: "error" });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <div
          ref={ref}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto m-2"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  disabled={!!defaultClientId}
>
  {/* Show placeholder only if NO default client */}
  {!defaultClientId && <option value="">Select client</option>}

  {clients?.map((client) => (
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
                  {drivers?.map((driver) => (
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

            {/* Vehicle - Auto-fills vehicle type */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
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
                  {vehicles?.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNo}
                      {vehicle.model && ` - ${vehicle.model}`}
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.vehicleId.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="challanNo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Challan No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="challanNo"
                  {...register("challanNo", {
                    required: "Challan No is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.challanNo ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 12345"
                />
                {errors.challanNo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.challanNo.message}
                  </p>
                )}
              </div>
            </div>

            {/* Hidden vehicle type field - auto-filled */}
            <input type="hidden" {...register("vehicleTypeId")} />

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

            {/* Row 2: Date and Start Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="endTime"
                  {...register("endTime", {
                    required: "End time is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.endTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Hours, Rate, and Auto-calculated Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="totalHours"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="totalHours"
                  {...register("totalHours", {
                    required: "Total hours is required",
                    min: { value: 0, message: "Hours must be positive" },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
                    errors.totalHours ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 8"
                />
                {errors.totalHours && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.totalHours.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="ratePerHour"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rate/Hour (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
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
                  Total Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  {...register("amount")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                  placeholder="Auto-calculated"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated: {totalHours || 0} × ₹{ratePerHour || 0} = ₹
                  {(
                    (Number(totalHours) || 0) * (Number(ratePerHour) || 0)
                  ).toFixed(2)}
                </p>
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
        {NotificationComponent}
      </div>
    );
  }
);

AddJob.displayName = "AddJob";

export default AddJob;