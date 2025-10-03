import { Plus } from "lucide-react";

// Dummy data for Vehicle Types
const vehicleTypes = [
  {
    name: "Heavy Truck",
    description: "10-ton capacity trucks for heavy cargo transport",
  },
  {
    name: "Mini Van",
    description: "Small vans for city deliveries and light cargo",
  },
  {
    name: "Pickup Truck",
    description:
      "4-ton pickup trucks for medium cargo and construction materials",
  },
];

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
          <button className="flex gap-1 items-center text-text-dark font-semibold py-2 px-2 border border-[#c6c6c6] rounded-md cursor-pointer hover:bg-gray-50 transition delay-100">
            <Plus size={16} />
            <span className="text-base font-semibold">Add Vehicle</span>
          </button>
          <button className="flex gap-1 items-center text-text-dark font-semibold py-2 px-2 border border-[#c6c6c6] rounded-md cursor-pointer hover:bg-gray-50 transition delay-100">
            <Plus size={16} />
            <span className="text-base font-semibold">Add Type</span>
          </button>
        </div>
      </div>
      <table className="w-full mt-20 max-w-2xl rounded-md">
        <thead >
          <tr className="border border-[#c6c6c6] text-primary">
            <td className="text-base font-bold p-2">Model</td>
            <td className="text-base font-bold p-2">Registration No.</td>
            <td className="text-base font-bold p-2">Vehicle Type</td>
            <td className="text-base font-bold p-2">Insurance Expiry</td>
          </tr>
        </thead>
      </table>
    </div>
  );
};

export default Vehicles;
