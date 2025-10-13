"use client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { RefObject, useRef, useState } from "react";
import { useOnclickOutside } from "../hooks/useOnclickOutside";
import DeleteModal from "../_components/DeleteModal";
import { Driver, useDriver } from "../hooks/useDriver";
import AddDriver from "../_components/AddDriver";

const Drivers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const addDriverRef = useRef<HTMLElement>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const { drivers, loading, error, addDriver, deleteDriver } = useDriver();

  const fetchDrivers = async () => {
    // This is handled by the hook automatically
  };

  const handleEdit = (item: any) => {
    console.log(" Edit:", item);
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  useOnclickOutside(addDriverRef as React.RefObject<HTMLElement>, () => {
    setIsModalOpen(false);
  });

  const handleDeleteDriver = async (itemToDelete: any) => {
    await deleteDriver(itemToDelete.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between w-full items-center">
        <div>
          <h1 className="text-4xl font-semibold">Drivers</h1>
          <p className="text-base text-text-light">
            Manage your fleet drivers and their details.
          </p>
        </div>
        <div className="flex gap-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-1 items-center text-text-dark font-semibold py-2 px-4 border border-[#c6c6c6] rounded-md cursor-pointer hover:bg-gray-50 transition delay-100"
          >
            <Plus size={16} />
            <span className="text-base font-semibold">Add Driver</span>
          </button>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="w-full mt-20 max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading drivers...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Error loading drivers
            </div>
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
                    <td className="p-4 text-gray-900 font-medium">
                      {driver.name}
                    </td>
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

      {/* Add Driver Modal */}
      {isModalOpen && (
        <AddDriver
          ref={addDriverRef as RefObject<HTMLDivElement>}
          setIsModalOpen={setIsModalOpen}
          addDriver={addDriver}
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
