"use client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { RefObject, useRef, useState, useEffect } from "react";
import AddVehicles from "../_components/AddVehicles";
import { useOnclickOutside } from "../hooks/useOnclickOutside";
import AddVehicleType from "../_components/AddVehicleType";
import DeleteModal from "../_components/DeleteModal";
import { useVehicleType } from "../hooks/useVehicletype";
import { useVehicle } from "../hooks/useVehicle";

const Vehicles = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddVehicleTypeModal, setIsAddVehicleTypeModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const addVehicleRef = useRef<HTMLElement>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const { vehicleTypes, fetchVehicleTypes, addVehicleType } = useVehicleType();

  const { vehicles, fetchVehicles, total } = useVehicle();
  console.log("-----",vehicles);

  // Pagination + Search states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  // Re-fetch when page/search changes
  useEffect(() => {
    fetchVehicles(page, limit, search);
  }, [page, search]);

  const handleEdit = (item: any) => console.log("Edit:", item);
  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page when searching
  };

  const totalPages = Math.ceil(total / limit);

  useOnclickOutside(addVehicleRef as RefObject<HTMLElement>, () =>
    setIsModalOpen(false)
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between w-full items-center">
        <div>
          <h1 className="text-4xl font-semibold">Vehicles</h1>
          <p className="text-base text-text-light">
            Manage your fleet vehicles and types.
          </p>
        </div>
        <div className="flex gap-6">
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
      <div className="mt-6 flex justify-end">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by model or registration no."
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
        />
      </div>

      {/* Vehicles Table */}
      <div className="w-full mt-10 max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b-2 border-indigo-200">
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
              {vehicles.length > 0 ? (
                vehicles.map((vehicle, i) => (
                  <tr
                    key={vehicle.id}
                    className={`transition-colors hover:bg-[#f6faff] ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-4 text-gray-900 font-medium">
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
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-gray-500 italic"
                  >
                    No vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
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
          onDelete={() => console.log("Delete")}
          item={itemToDelete}
          heading="Delete Vehicle"
          description="Are you sure you want to delete this vehicle?"
        />
      )}
    </div>
  );
};

export default Vehicles;
