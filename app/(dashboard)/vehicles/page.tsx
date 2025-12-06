"use client";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { RefObject, useRef, useState, useEffect } from "react";
import AddVehicles from "@/components/AddVehicles";
import { useOnclickOutside } from "@/hooks/useOnclickOutside";
import AddVehicleType from "@/components/AddVehicleType";
import DeleteModal from "@/components/DeleteModal";
import { useVehicleType } from "@/hooks/useVehicletype";
import { useVehicle } from "@/hooks/useVehicle";
import SearchBar from "@/components/SearchBar";
import RenderPageNumbers from "@/components/RenderPageNumbers";

const Vehicles = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddVehicleTypeModal, setIsAddVehicleTypeModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const addVehicleRef = useRef<HTMLElement>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const {
    vehicleTypes,
    fetchVehicleTypes,
    addVehicleType,
    loading: typeLoading,
    error: typeError,
  } = useVehicleType();

  const {
    vehicles,
    fetchVehicles,
    total,
    loading: vehicleLoading,
    error: vehicleError,
  } = useVehicle();

  // Pagination + Search states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  // Re-fetch when page/search changes
  useEffect(() => {
    fetchVehicles(currentPage, limit, searchTerm);
    fetchVehicleTypes();
  }, [currentPage, searchTerm]);

  const handleEdit = (item: any) => {};
  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useOnclickOutside(addVehicleRef as RefObject<HTMLElement>, () =>
    setIsModalOpen(false)
  );

  return (
    <div className="p-2 sm:p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between w-full sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold">Vehicles</h1>
          <p className="text-base text-text-light">
            Manage your fleet vehicles and types.
          </p>
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-1 items-center text-text-dark font-semibold py-2 px-2 border border-[#c6c6c6] rounded-md cursor-pointer hover:bg-gray-50 transition delay-100"
          >
            <Plus size={16} />
            <span className="text-base font-semibold">Add Vehicle</span>
          </button>
          <button
            onClick={() => setIsAddVehicleTypeModal(true)}
            className="flex gap-1 items-center text-text-dark font-semibold py-2 px-2 border border-[#c6c6c6] rounded-md cursor-pointer hover:bg-gray-50 transition delay-100"
          >
            <Plus size={16} />
            <span className="text-base font-semibold">Add Type</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-sm mt-5">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by model or registration no..."
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Vehicles Table */}
        <div className="w-full mt-10 max-w-5xl mx-auto sm:px-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {vehicleLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading vehicles...
              </div>
            ) : vehicleError ? (
              <div className="p-8 text-center text-red-500">
                Error loading vehicles.
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-8 text-center text-gray-500 italic">
                No vehicles created yet.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-white border-b-2 border-indigo-200 text-nowrap">
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Model
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Registration No.
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Vehicle Type
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                      Insurance Expiry
                    </th>
                    <th className="p-4 text-center text-sm font-semibold text-primary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicles.map((vehicle, i) => (
                    <tr
                      key={vehicle.id}
                      className={`transition-colors hover:bg-[#f6faff] ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-4 text-gray-900 font-medium text-nowrap">
                        {vehicle.model}
                      </td>
                      <td className="p-4 text-gray-700">
                        {vehicle.registrationNo}
                      </td>
                      <td className="p-3 text-gray-700">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {vehicle.vehicleType}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">
                        {vehicle.insuranceExpiry
                          ? new Date(vehicle.insuranceExpiry).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle)}
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
        </div>

        {/* Vehicle Types Table */}
        <div className="md:mt-10 mx-auto sm:px-4 min-w-sm sm:min-w-xs overflow-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {typeLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading vehicle types...
              </div>
            ) : typeError ? (
              <div className="p-8 text-center text-red-500">
                Error loading vehicle types.
              </div>
            ) : vehicleTypes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 italic">
                No vehicle types created yet.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-white border-b-2 border-indigo-200">
                    <th className="p-4 text-sm font-semibold text-primary uppercase tracking-wider text-left">
                      Type
                    </th>
                    <th className="p-4 text-sm font-semibold text-primary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicleTypes.map((type, i) => (
                    <tr
                      key={i}
                      className={`transition-colors hover:bg-[#f6faff] ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-4 text-gray-900 font-medium">
                        {type.name}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(type)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(type)}
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
      </div>

      {/* Modals */}
      {isModalOpen && (
        <AddVehicles
          ref={addVehicleRef as RefObject<HTMLDivElement>}
          setIsModalOpen={setIsModalOpen}
          vehicleTypes={vehicleTypes}
          fetchVehicles={fetchVehicles}
        />
      )}

      {isAddVehicleTypeModal && (
        <AddVehicleType
          setIsAddVehicleTypeModal={setIsAddVehicleTypeModal}
          addVehicleType={addVehicleType}
          fetchVehicleTypes={fetchVehicleTypes}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          setIsModalOpen={setIsDeleteModalOpen}
          onDelete={() => {}}
          item={itemToDelete}
          heading="Delete Vehicle"
          description="Are you sure you want to delete this vehicle?"
        />
      )}
    </div>
  );
};

export default Vehicles;