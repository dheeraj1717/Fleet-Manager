"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download, DollarSign } from "lucide-react";
import PrintInvoice from "@/components/PrintInvoice";
import useInvoiceDetails from "@/hooks/useInvoiceDetails";

const InvoiceDetails = () => {
  const params = useParams();
  const router = useRouter();
  const { invoice, loading, error } = useInvoiceDetails(params.id as string);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const userCompany = {
    name: "M/S HIGH TECH INFRASTRUCTURES",
    address: "115, Near Patwar Bhawan, Ghumiya, Palra Ajmer, Rajasthan 305025",
    contactNo: "+9950133883, 9829864353",
    email: "highTechInfrastructures@gmail.com",
    gstin: "08RNOR2362C1ZR",
    bankDetails: {
      bankName: "Bank Of Baroda",
      accountNo: "40300200000351",
      branch: "Makhupura Ind. Area, Ajmer- 305001",
      ifscCode: "BARBOMAKHUP ( Fifth Letter Is Zero)",
    },
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-20">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8">
        <div className="text-center py-20 text-red-500">
          {error || "Invoice not found"}
        </div>
      </div>
    );
  }

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
      <div className="flex flex-col md:flex-row justify-between sm:items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back to Invoices
        </button>

        <button
          onClick={() => setShowPrintModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors delay-100 cursor-pointer w-fit mt-4 md:mt-0"
        >
          <Printer size={18} />
          Print / Download Invoice
        </button>
      </div>

      {/* Invoice Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-base sm:text-3xl font-bold text-gray-900">
              Invoice #{invoice.invoiceNumber}
            </h1>
            <p className="text-gray-500 mt-1">
              Created on {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(
              invoice.status
            )}`}
          >
            {invoice.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              Client Details
            </h3>
            <p className="text-lg font-semibold">{invoice.client.name}</p>
            {invoice.client.company && (
              <p className="text-gray-600">{invoice.client.company}</p>
            )}
            <p className="text-gray-600">{invoice.client.contactNo}</p>
            {invoice.client.email && (
              <p className="text-gray-600">{invoice.client.email}</p>
            )}
            <p className="text-gray-600 mt-2">{invoice.client.address}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              Billing Period
            </h3>
            <p className="text-gray-900">
              <span className="font-medium">From:</span>{" "}
              {new Date(invoice.startDate).toLocaleDateString()}
            </p>
            <p className="text-gray-900">
              <span className="font-medium">To:</span>{" "}
              {new Date(invoice.endDate).toLocaleDateString()}
            </p>
            <p className="text-gray-900 mt-4">
              <span className="font-medium">Total Jobs:</span> {invoice.jobs.length}
            </p>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <p className="text-sm font-semibold text-gray-700">Notes:</p>
            <p className="text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Amount Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Subtotal</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{invoice.subtotal.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Tax (GST 18%)</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{invoice.tax.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-purple-600">
            ₹{invoice.totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Balance Due</p>
          <p className="text-2xl font-bold text-orange-600">
            ₹{invoice.balanceAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
        <h3 className="text-xl font-semibold mb-4">Jobs Included</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-indigo-200 text-nowrap">
                <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                  S.No
                </th>
                <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                  Date
                </th>
                <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                  Challan No
                </th>
                <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                  Description
                </th>
                <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                  Hours
                </th>
                <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                  Rate
                </th>
                <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.jobs.map((job, index) => (
                <tr
                  key={job.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-4 text-gray-900">{index + 1}</td>
                  <td className="p-4 text-gray-700">
                    {new Date(job.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-gray-700">{job.challanNo}</td>
                  <td className="p-4 text-gray-700">
                    {new Date(job.startTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                    {" - "}
                    {new Date(job.endTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="p-4 text-gray-700">{job.totalHours}</td>
                  <td className="p-4 text-gray-700">₹{job.ratePerHour}</td>
                  <td className="p-4 text-gray-900 font-semibold">
                    ₹{job.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-indigo-200 text-nowrap">
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Date
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Amount
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Method
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Reference
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.payments.map((payment, index) => (
                  <tr
                    key={payment.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-4 text-gray-700">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-green-600 font-semibold">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-700">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {payment.paymentMethod.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">
                      {payment.referenceNo || "-"}
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {payment.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Payment Button (if balance > 0) */}
      {invoice.balanceAmount > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => router.push(`/invoices/${invoice.id}/payment`)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            <DollarSign size={20} />
            Record Payment
          </button>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && (
        <PrintInvoice
          invoice={invoice}
          onClose={() => setShowPrintModal(false)}
          userCompany={userCompany}
        />
      )}
    </div>
  );
};

export default InvoiceDetails;