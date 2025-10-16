"use client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { RefObject, useRef, useState } from "react";
import AddJob from "../_components/AddJob";
import { useOnclickOutside } from "../hooks/useOnclickOutside";
import DeleteModal from "../_components/DeleteModal";
import { useJobs } from "../hooks/useJobs";
import { useClient } from "../hooks/useClient";
import { useDriver } from "../hooks/useDriver";
import { useVehicle } from "../hooks/useVehicle";
import { useVehicleType } from "../hooks/useVehicletype";

const Jobs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const addJobRef = useRef<HTMLElement>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const { jobs, loading, error, addJob, deleteJob, fetchJobs } = useJobs();
  const { clients } = useClient();
  const { drivers } = useDriver();
  const { vehicles } = useVehicle();
  const { vehicleTypes } = useVehicleType();

  const handleEdit = (item: any) => {
    console.log("Edit:", item);
    // TODO: Implement edit functionality
  };

  const handleDelete = (item: any) => {
    console.log("Delete:", item);
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  useOnclickOutside(addJobRef as React.RefObject<HTMLElement>, () => {
    setIsModalOpen(false);
  });

  const handleDeleteJob = async (itemToDelete: any) => {
    if (itemToDelete?.id) {
      await deleteJob(itemToDelete.id);
    }
    setIsDeleteModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      COMPLETED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
      statusStyles[status as keyof typeof statusStyles] ||
      "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between w-full items-center">
        <div>
          <h1 className="text-4xl font-semibold">Jobs</h1>
          <p className="text-base text-text-light">
            Manage your fleet jobs and assignments.
          </p>
        </div>
        <div className="flex gap-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-1 items-center text-text-dark font-semibold py-2 px-4 border border-[#c6c6c6] rounded-md cursor-pointer hover:bg-gray-50 transition delay-100"
          >
            <Plus size={16} />
            <span className="text-base font-semibold">Add Job</span>
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="w-full mt-20 mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading jobs...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Error loading jobs
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No jobs found. Add your first job!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white border-b-2 border-indigo-200">
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Job #
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Client
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Location
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Date
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-4 text-center text-sm font-semibold text-primary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobs.map((job: any, i: number) => (
                    <tr
                      key={job.id}
                      className={`transition-colors hover:bg-[#f6faff] ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-4 text-gray-900 font-medium">
                        #{job.jobNumber || job.id.slice(0, 8)}
                      </td>
                      <td className="p-4 text-gray-700">
                        {job.client?.name || "N/A"}
                      </td>
                      <td className="p-4 text-gray-700">
                        {job.driver?.name || "N/A"}
                      </td>
                      <td className="p-4 text-gray-700">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {job.vehicle?.registrationNo || "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {job.vehicle?.vehicleType?.name || job.vehicleType?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 max-w-xs truncate">
                        {job.location}
                      </td>
                      <td className="p-4 text-gray-700">
                        {new Date(job.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-900 font-semibold">
                        ₹{Number(job.amount).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                            job.status
                          )}`}
                        >
                          {job.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(job)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(job)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Job Modal */}
      {isModalOpen && (
        <AddJob
          ref={addJobRef as RefObject<HTMLDivElement>}
          setIsModalOpen={setIsModalOpen}
          addJob={addJob}
          fetchJobs={fetchJobs}
          clients={clients || []}
          drivers={drivers || []}
          vehicles={vehicles || []}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          setIsModalOpen={setIsDeleteModalOpen}
          onDelete={handleDeleteJob}
          item={itemToDelete}
          heading="Delete Job"
          description="Are you sure you want to delete this job? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default Jobs;