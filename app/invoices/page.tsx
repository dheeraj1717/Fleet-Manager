"use client";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  DollarSign,
  Calendar,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useInvoices } from "../hooks/useInvoices";
import { useEffect, useState } from "react";
import SearchBar from "../_components/SearchBar";
import RenderPageNumbers from "../_components/RenderPageNumbers";

const Invoices = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { invoices, loading, filter, setFilter, total, fetchInvoices } =
    useInvoices();
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    fetchInvoices(currentPage, limit, searchTerm);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query.trim());
    setCurrentPage(1); // reset to page 1 on new search
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-800",
      SENT: "bg-blue-100 text-blue-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      PARTIAL: "bg-orange-100 text-orange-800",
      PAID: "bg-green-100 text-green-800",
      OVERDUE: "bg-red-100 text-red-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-2 sm:p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-xl sm:text-4xl font-semibold">Invoices</h1>
          <p className="text-base text-gray-500">
            Manage client invoices and payments
          </p>
        </div>
        <button
          onClick={() => router.push("/invoices/generate")}
          className="flex gap-2 items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors delay-100 cursor-pointer mt-4 sm:mt-0 w-fit"
        >
          <Plus size={18} />
          Generate Invoice
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-sm my-5">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by name or contact..."
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-auto">
        {["all", "DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === status
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {status === "all" ? "All" : status}
            </button>
          )
        )}
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No invoices found. Generate your first invoice!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-indigo-200">
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Invoice Number
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Client
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Period
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Jobs
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Total
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Paid
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Balance
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Status
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-primary uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice, i) => (
                  <tr
                    key={invoice.id}
                    className={`transition-colors hover:bg-blue-50 cursor-pointer ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                  >
                    <td className="p-4 text-gray-900 font-medium">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-nowrap">
                          {invoice.client.name}
                        </span>
                        {invoice.client.company && (
                          <span className="text-xs text-gray-500">
                            {invoice.client.company}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700 text-nowrap">
                      <div className="flex gap-1 text-sm">
                        <span>
                          {new Date(invoice.startDate).toLocaleDateString()}
                        </span>
                        <span className="text-gray-500">-</span>
                        <span>
                          {new Date(invoice.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{invoice._count.jobs}</td>
                    <td className="p-4 text-gray-900 font-semibold">
                      ₹{invoice.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4 text-green-600 font-medium">
                      ₹{invoice.paidAmount.toLocaleString()}
                    </td>
                    <td className="p-4 text-orange-600 font-medium">
                      ₹{invoice.balanceAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/invoices/${invoice.id}`);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <FileText size={18} />
                        </button>
                        {invoice.balanceAmount > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/invoices/${invoice.id}/payment`);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Add Payment"
                          >
                            <DollarSign size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

      {/* Summary Cards */}
      {!loading && invoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
            <p className="text-3xl font-bold text-gray-900">
              {invoices.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-blue-600">
              ₹
              {invoices
                .reduce((sum, inv) => sum + inv.totalAmount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Paid</p>
            <p className="text-3xl font-bold text-green-600">
              ₹
              {invoices
                .reduce((sum, inv) => sum + inv.paidAmount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-orange-600">
              ₹
              {invoices
                .reduce((sum, inv) => sum + inv.balanceAmount, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
