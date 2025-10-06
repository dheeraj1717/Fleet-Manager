"use client";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { RefObject, useRef, useState } from "react";
import AddVehicles from "../_components/AddVehicles";
import { useOnclickOutside } from "../hooks/useOnclickOutside";
import AddVehicleType from "../_components/AddVehicleType";
import DeleteModal from "../_components/DeleteModal";
import { useVehicleType } from "../hooks/useVehicletype";

// Dummy data for Vehicle Types
// const vehicleTypes = [
//   {
//     id: "vtype-1",
//     name: "Heavy Truck",
//     description: "10-ton capacity trucks for heavy cargo transport",
//   },
//   {
//     id: "vtype-2",
//     name: "Mini Van",
//     description: "Small vans for city deliveries and light cargo",
//   },
//   {
//     id: "vtype-3",
//     name: "Pickup Truck",
//     description:
//       "4-ton pickup trucks for medium cargo and construction materials",
//   },
// ];

// Dummy data for Vehicles
const vehicles = [
  {
    registrationNo: "TN 01 AB 1234",
    model: "Tata LPT 1613",
    isActive: true,
    insuranceExpiry: new Date("2025-12-15"),
    vehicleTypeId: "vtype-1",
  },
  {
    registrationNo: "TN 02 CD 5678",
    model: "Mahindra Bolero Pickup",
    isActive: true,
    insuranceExpiry: new Date("2025-11-10"),
    vehicleTypeId: "vtype-3",
  },
  {
    registrationNo: "TN 03 EF 9012",
    model: "Ashok Leyland Dost+",
    isActive: true,
    insuranceExpiry: new Date("2025-10-05"),
    vehicleTypeId: "vtype-2",
  },
];

const Vehicles = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddVehicleTypeModal, setIsAddVehicleTypeModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const addVehicleRef = useRef<HTMLElement>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null)
  const {vehicleTypes, loading, error} = useVehicleType();
  const [formData, setFormData] = useState({
    model: "",
    registrationNo: "",
    vehicleTypeId: "",
    insuranceExpiry: "",
  });

  const handleEdit = (item: any) => {
    console.log("Edit:", item);
  };

  const handleDelete = (item: any) => {
    console.log("Delete:", item);
    setItemToDelete(item)
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your API call here
    setIsModalOpen(false);
    setFormData({
      model: "",
      registrationNo: "",
      vehicleTypeId: "",
      insuranceExpiry: "",
    });
  };
  useOnclickOutside(addVehicleRef as React.RefObject<HTMLElement>, () => {
    setIsModalOpen(false);
  });

  const handleAddVehicleType = () => {
    setIsAddVehicleTypeModal(true);
  };

  const handleDeleteVehicle = (itemToDelete:any) => {
    console.log("Delete vehicle");
    setIsDeleteModalOpen(true);
  }

  const toggleDeleteModal = () => {
    setIsDeleteModalOpen(!isDeleteModalOpen);
  };

  return (
    <div className="p-8">
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
            onClick={handleAddVehicleType}
            className="flex gap-1 items-center text-text-dark font-semibold py-2 px-2 border border-[#c6c6c6] rounded-md cursor-pointer hover:bg-gray-50 transition delay-100"
          >
            <Plus size={16} />
            <span className="text-base font-semibold">Add Type</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Vehicles Table */}
        <div className="w-full mt-20 max-w-4xl mx-auto px-4">
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
                {vehicles.map((vehicle, i) => (
                  <tr
                    key={vehicle.registrationNo}
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
                      {/* <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {
                          vehicleTypes.find(
                            (t) => t.id === vehicle.vehicleTypeId
                          )?.name
                        }
                      </span> */}
                    </td>
                    <td className="p-4 text-gray-700">
                      {vehicle.insuranceExpiry.toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
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
          </div>
        </div>

        {/* Vehicle Types Table */}
        <div className="mt-20 mx-auto px-4 min-w-xs">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
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
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <AddVehicles
          ref={addVehicleRef as RefObject<HTMLDivElement>}
          setIsModalOpen={setIsModalOpen}
          vehicleTypes={vehicleTypes}
        />
      )}

      {/* Add Vehicle Type Modal */}
      {isAddVehicleTypeModal && (
        <AddVehicleType setIsAddVehicleTypeModal={setIsAddVehicleTypeModal} />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          setIsModalOpen={setIsDeleteModalOpen}
          onDelete={handleDeleteVehicle}
          item={itemToDelete}
          heading="DeleteVehicle"
          description="Are you sure you want to delete this vehicle?"
        />
      )}
    </div>
  );
};

export default Vehicles;
