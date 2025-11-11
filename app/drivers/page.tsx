"use client";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { RefObject, useRef, useState, useEffect } from "react";
import { useOnclickOutside } from "../hooks/useOnclickOutside";
import DeleteModal from "../_components/DeleteModal";
import { useDriver } from "../hooks/useDriver";
import AddDriver from "../_components/AddDriver";
import RenderPageNumbers from "../_components/RenderPageNumbers";
import SearchBar from "../_components/SearchBar";

const Drivers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const addDriverRef = useRef<HTMLElement>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const { drivers, loading, error, total, deleteDriver, fetchDrivers } = useDriver();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  // Fetch drivers when page or search changes
  useEffect(() => {
    fetchDrivers(currentPage, limit, searchTerm);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query.trim());
    setCurrentPage(1); // reset to page 1 on new search
  };

  const handleEdit = (item: any) => {
    console.log("Edit:", item);
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  useOnclickOutside(addDriverRef as RefObject<HTMLElement>, () => {
    setIsModalOpen(false);
  });

  const handleDeleteDriver = async (itemToDelete: any) => {
    await deleteDriver(itemToDelete.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-8">
      {/* Header + Add Button */}
      <div className="flex justify-between w-full items-center mb-8">
        <div>
          <h1 className="text-4xl font-semibold">Drivers</h1>
          <p className="text-base text-text-light">
            Manage your fleet drivers and their details.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex gap-1 items-center text-text-dark font-semibold py-2 px-4 border border-[#c6c6c6] rounded-md cursor-pointer hover:bg-gray-50 transition delay-100"
        >
          <Plus size={16} />
          <span className="text-base font-semibold">Add Driver</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-sm mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Search by name or contact..." />
      </div>

      {/* Drivers Table */}
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading drivers...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error loading drivers</div>
          ) : drivers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No drivers found. Add your first driver!
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b-2 border-indigo-200">
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Contact No.
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    License No.
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Address
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Joining Date
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-primary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {drivers.map((driver: any, i: number) => (
                  <tr
                    key={driver.id}
                    className={`transition-colors hover:bg-[#f6faff] ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-4 text-gray-900 font-medium">{driver.name}</td>
                    <td className="p-4 text-gray-700">{driver.contactNo}</td>
                    <td className="p-4 text-gray-700">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {driver.licenseNo}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 max-w-xs truncate">
                      {driver.address}
                    </td>
                    <td className="p-4 text-gray-700">
                      {driver.joiningDate
                        ? new Date(driver.joiningDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(driver)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(driver)}
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
          )}
        </div>
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

      {/* Add Driver Modal */}
      {isModalOpen && (
        <AddDriver
          ref={addDriverRef as RefObject<HTMLDivElement>}
          setIsModalOpen={setIsModalOpen}
          fetchDrivers={fetchDrivers}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          setIsModalOpen={setIsDeleteModalOpen}
          onDelete={handleDeleteDriver}
          item={itemToDelete}
          heading="Delete Driver"
          description="Are you sure you want to delete this driver? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default Drivers;
