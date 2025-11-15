import { X } from "lucide-react";

const DeleteModal = ({
  setIsModalOpen,
  onDelete,
  item,
  heading,
  description,
}: {
  setIsModalOpen: (isOpen: boolean) => void;
  onDelete: (itemToDelete: any) => void;
  item: any;
  heading: string;
  description: string;
}) => {

  console.log(item);
  const handleDelete = (item: any) => {
    onDelete(item);
    setIsModalOpen(false);
  };
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          type="button"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 capitalize">{heading}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={() => handleDelete(item)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
