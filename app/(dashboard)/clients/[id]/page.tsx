"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useClientJobs } from "@/hooks/useClientJobs";

const ClientDetails = () => {
  const params = useParams();
  const router = useRouter();
  const { client, jobs, loading, error } = useClientJobs(params.id);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [jobFilter, setJobFilter] = useState<"all" | "billed" | "unbilled">(
    "all"
  );

  const filteredJobs = jobs.filter((job) => {
    if (jobFilter === "billed") return job.invoiceId !== null;
    if (jobFilter === "unbilled") return job.invoiceId === null;
    return true;
  });

  // Your company details - Replace with actual data or fetch from API
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-20">Loading client details...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8">
        <div className="text-center py-20 text-red-500">
          {error || "Client not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Back to Clients</span>
      </button>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setJobFilter("all")}
          className={`px-4 py-2 rounded-md ${
            jobFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          All Jobs
        </button>
        <button
          onClick={() => setJobFilter("unbilled")}
          className={`px-4 py-2 rounded-md ${
            jobFilter === "unbilled"
              ? "bg-orange-600 text-white"
              : "bg-gray-100"
          }`}
        >
          Unbilled ({jobs.filter((j) => !j.invoiceId).length})
        </button>
        <button
          onClick={() => setJobFilter("billed")}
          className={`px-4 py-2 rounded-md ${
            jobFilter === "billed" ? "bg-green-600 text-white" : "bg-gray-100"
          }`}
        >
          Billed ({jobs.filter((j) => j.invoiceId).length})
        </button>
      </div>

      {/* Client Details Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 sm:p-4 md:p-8 mb-8">
        <div className="flex flex-col-reverse sm:flex-row justify-between items-start mb-6">
          <div className="mt-3 sm:mt-0">
            <h1 className="text-xl sm:text-3xl font-semibold text-gray-900">
              {client.name}
            </h1>
            <p className="text-gray-500 mt-1">Client Details</p>
          </div>
          <div className="flex gap-3 items-center mt-2 sm:mt-0">
            <span
              className={`px-3 py-1 rounded-full h-fit text-sm font-medium ${
                client.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {client.isActive ? "Active" : "Inactive"}
            </span>
            {/* <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Printer size={18} />
              Print Bill
            </button> */}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Contact Number
            </label>
            <p className="text-lg text-gray-900 mt-1">{client.contactNo}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg text-gray-900 mt-1">
              {client.email || "Not provided"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Company</label>
            <p className="text-lg text-gray-900 mt-1">
              {client.company || "Not provided"}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">Address</label>
            <p className="text-lg text-gray-900 mt-1">{client.address}</p>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 sm:p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Jobs</h2>
          <span className="text-sm text-gray-500">
            Total: {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No jobs found for this client yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-indigo-200 text-nowrap">
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Ch. No
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Description
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Time (Hrs)
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-primary uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job, i) => (
                  <tr
                    key={job.id}
                    className={`transition-colors hover:bg-[#f6faff] ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-4 text-gray-900 font-medium">{i + 1}</td>
                    <td className="p-4 text-gray-700">
                      {new Date(job.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-700">{job.challanNo}</td>
                    <td className="p-4 text-gray-700 text-nowrap">
                      {formatTime(job.startTime)} - {formatTime(job.endTime!)}
                    </td>
                    <td className="p-4 text-gray-700">
                      {job.totalHours! % 1 === 0
                        ? job.totalHours!.toFixed(0)
                        : job.totalHours!.toFixed(1)}
                    </td>
                    <td className="p-4 text-gray-700">
                      ₹{job.ratePerHour.toFixed(0)}
                    </td>
                    <td className="p-4 text-gray-700 font-medium">
                      ₹{job.amount.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Section */}
        {jobs.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-blue-900">
                  {jobs.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">
                  Total Hours
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {jobs
                    .reduce((sum, job) => sum + (job.totalHours || 0), 0)
                    .toFixed(1)}
                  h
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  ₹
                  {jobs
                    .reduce((sum, job) => sum + (job.amount || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Modal */}
      {/* {showPrintModal && (
        <PrintBill
          client={client}
          jobs={jobs}
          onClose={() => setShowPrintModal(false)}
          userCompany={userCompany}
        />
      )} */}
    </div>
  );
};

export default ClientDetails;
