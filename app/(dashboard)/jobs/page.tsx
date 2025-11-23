"use client";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { RefObject, useRef, useState, useEffect } from "react";
import { useOnclickOutside } from "@/hooks/useOnclickOutside";
import { useJobs } from "@/hooks/useJobs";
import { useClient } from "@/hooks/useClient";
import { useDriver } from "@/hooks/useDriver";
import { useVehicle } from "@/hooks/useVehicle";
import SearchBar from "@/components/SearchBar";
import RenderPageNumbers from "@/components/RenderPageNumbers";
import DeleteModal from "@/components/DeleteModal";
import AddJob from "@/components/AddJob";
import useNotification from "@/hooks/useNotification";

const Jobs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const { triggerNotification, NotificationComponent } = useNotification();

  const {
    jobs,
    total,
    loading,
    error,
    addJobError,
    addJob,
    deleteJob,
    fetchJobs,
  } = useJobs();
  const { clients, fetchClients } = useClient();
  const { drivers, fetchDrivers } = useDriver();
  const { vehicles, fetchVehicles } = useVehicle();

  useEffect(() => {
    fetchClients(1, 20);
    fetchDrivers(1, 20);
    fetchVehicles(1, 20);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const handleSearch = (query: string) => {
    setSearchTerm(query.trim());
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchJobs(currentPage, limit, searchTerm);
  }, [currentPage, searchTerm]);

  const handleEdit = (item: any) => console.log("Edit:", item);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteJob = async (item: any) => {
    try {
      if (item?.id) await deleteJob(item.id);
      setIsDeleteModalOpen(false);
      triggerNotification({ message: "Job deleted successfully", type: "success" });
    } catch (error) {
      triggerNotification({ message: "Something went wrong", type: "error" });
    }
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
    <div className="p-2 sm:p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between w-full sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold">Jobs</h1>
          <p className="text-base text-text-light">
            Manage your fleet jobs and assignments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex gap-1 items-center text-text-dark font-semibold py-2 px-4 border border-[#c6c6c6] rounded-md cursor-pointer hover:bg-gray-50 transition delay-100 mt-4 sm:mt-0 w-fit"
        >
          <Plus size={16} />
          <span className="text-base font-semibold">Add Job</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-sm mt-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by client, driver, challan, or vehicle..."
        />
      </div>

      {/* Jobs Table */}
      <div className="w-full mt-10 max-w-6xl mx-auto sm:px-4">
        <div className="bg-white rounded-lg shadow-md overflow-auto border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading jobs...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Error loading jobs
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No jobs found.</div>
          ) : (
            <table className="w-full text-nowrap">
              <thead>
                <tr className="bg-white border-b-2 border-indigo-200">
                  <th className="p-4 text-left text-sm font-semibold text-primary tracking-wider">
                    Sr. No
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Challan No.
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
                  {/* <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Status
                  </th> */}
                  <th className="p-4 text-center text-sm font-semibold text-primary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {jobs.map((job: any, i: number) => (
                  <tr
                    key={job.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-[#f6faff]`}
                  >
                    <td className="p-4 font-medium">
                      {(currentPage - 1) * limit + i + 1}
                    </td>

                    <td className="p-4 font-medium">{job.challanNo || "-"}</td>

                    <td className="p-4">{job.client?.name || "N/A"}</td>

                    <td className="p-4">{job.driver?.name || "N/A"}</td>

                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {job.vehicle?.registrationNo || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {job.vehicle?.vehicleType?.name || "N/A"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">{job.location}</td>

                    <td className="p-4">
                      {new Date(job.date).toLocaleDateString()}
                    </td>

                    <td className="p-4 font-semibold">
                      ₹{Number(job.amount).toLocaleString()}
                    </td>

                    {/* <td className="p-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                          job.status
                        )}`}
                      >
                        {job.status.replace("_", " ")}
                      </span>
                    </td> */}

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(job)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          disabled={job.invoiceId !== null}
                          onClick={() => handleDelete(job)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:cursor-default disabled:hover:bg-red-50/10"
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
          )}
        </div>

        {/* Pagination */}
        {total > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <RenderPageNumbers
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Add Job Modal */}
        {isModalOpen && (
          <AddJob
            setIsModalOpen={setIsModalOpen}
            addJobError={addJobError}
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
      {NotificationComponent}
    </div>
  );
};

export default Jobs;
