"use client";
import { Plus, Pencil, Trash2, ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";
import AddClient from "../_components/AddClient";
import { useOnclickOutside } from "../hooks/useOnclickOutside";
import DeleteModal from "../_components/DeleteModal";
import { useClient } from "../hooks/useClient";
import { useRouter } from "next/navigation";
import SearchBar from "../_components/SearchBar";
import RenderPageNumbers from "../_components/RenderPageNumbers";

const Clients = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const addClientRef = useRef<HTMLElement>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const { clients, loading, error, addClient, deleteClient, fetchClients, total } = useClient();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
      fetchClients(currentPage, limit, searchTerm);
    }, [currentPage, searchTerm]);
  
    const handlePageChange = (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    };
  
    const handleSearch = (query: string) => {
      setSearchTerm(query.trim());
      setCurrentPage(1); // reset to page 1 on new search
    };

  const handleRowClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };
  const handleEdit = (item: any) => {
    console.log("Edit:", item);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  useOnclickOutside(addClientRef as React.RefObject<HTMLElement>, () => {
    setIsModalOpen(false);
  });

  const handleDeleteClient = async (itemToDelete: any) => {
    if (itemToDelete?.id) {
      await deleteClient(itemToDelete.id);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between w-full items-center">
        <div>
          <h1 className="text-4xl font-semibold">Clients</h1>
          <p className="text-base text-text-light">
            Manage your clients and their contact information.
          </p>
        </div>
        <div className="flex gap-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-1 items-center text-text-dark font-semibold py-2 px-4 border border-[#c6c6c6] rounded-md cursor-pointer hover:bg-gray-50 transition delay-100"
          >
            <Plus size={16} />
            <span className="text-base font-semibold">Add Client</span>
          </button>
        </div>
      </div>

        {/* Search Bar */}
      <div className="max-w-sm mt-6">
        <SearchBar onSearch={handleSearch} placeholder="Search by name or contact..." />
      </div>

      {/* Clients Table */}
      <div className="w-full mt-10 max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading clients...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error loading clients</div>
          ) : !clients || clients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No clients found. Add your first client!
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
                    Email
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Company
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Address
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-primary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client: any, i: number) => (
                  <tr
                  onClick={() => handleRowClick(client.id)}
                    key={client.id}
                    className={`transition-colors cursor-pointer hover:bg-[#f6faff] ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-4 text-gray-900 font-medium">
                      {client.name}
                    </td>
                    <td className="p-4 text-gray-700">{client.contactNo}</td>
                    <td className="p-4 text-gray-700">
                      {client.email || "-"}
                    </td>
                    <td className="p-4 text-gray-700">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {client.company || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 max-w-xs truncate">
                      {client.address}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, client)}
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

      {/* Add Client Modal */}
      {isModalOpen && (
        <AddClient
          ref={addClientRef as RefObject<HTMLDivElement>}
          setIsModalOpen={setIsModalOpen}
          addClient={addClient}
          fetchClients={fetchClients}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          setIsModalOpen={setIsDeleteModalOpen}
          onDelete={handleDeleteClient}
          item={itemToDelete}
          heading="Delete Client"
          description="Are you sure you want to delete this client? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default Clients;