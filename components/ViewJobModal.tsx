"use client";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  Truck,
  DollarSign,
} from "lucide-react";
import { useOnclickOutside } from "@/hooks/useOnclickOutside";
import { useRef, RefObject } from "react";

interface ViewJobModalProps {
  job: any;
  onClose: () => void;
}

const ViewJobModal = ({ job, onClose }: ViewJobModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnclickOutside(modalRef as RefObject<HTMLDivElement>, onClose);

  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const DetailItem = ({
    icon: Icon,
    label,
    value,
    color = "text-gray-600",
  }: any) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 border border-gray-100">
      <div className="mt-0.5 p-1.5 bg-white rounded-md border border-gray-200 shadow-sm">
        <Icon size={16} className="text-blue-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className={`text-sm font-semibold mt-0.5 ${color}`}>
          {value || "-"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
              <p className="text-sm text-gray-500 font-medium">
                Challan No: {job.challanNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project/Client Info */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Basic Information
              </h3>
            </div>
            <DetailItem icon={User} label="Client" value={job.client?.name} />
            <DetailItem icon={User} label="Driver" value={job.driver?.name} />
            <DetailItem
              icon={Truck}
              label="Vehicle No."
              value={job.vehicle?.registrationNo}
            />
            <DetailItem
              icon={Truck}
              label="Vehicle Type"
              value={job.vehicleType?.name}
            />

            {/* Time & Location */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Timing & Location
              </h3>
            </div>
            <DetailItem
              icon={Calendar}
              label="Date"
              value={new Date(job.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <DetailItem
              icon={Clock}
              label="Times"
              value={`${formatTime(job.startTime)} - ${formatTime(
                job.endTime
              )}`}
            />
            <DetailItem
              icon={Clock}
              label="Total Hours"
              value={`${job.totalHours} hrs`}
            />

            {/* Billing */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Financial Details
              </h3>
            </div>
            <DetailItem
              icon={DollarSign}
              label="Rate per Hour"
              value={`₹${job.ratePerHour}`}
            />
            <DetailItem
              icon={DollarSign}
              label="Total Amount"
              value={`₹${job.amount}`}
              color="text-green-600"
            />

            {/* Notes */}
            {job.notes && (
              <div className="md:col-span-2 mt-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Notes
                </p>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed italic">
                  "{job.notes}"
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 transition-colors cursor-pointer text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewJobModal;
