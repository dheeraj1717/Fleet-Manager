import { X, CheckCircle2, AlertCircle, AlertTriangle, Lightbulb } from "lucide-react";

export type NotificationType = "success" | "info" | "error" | "warning";

export interface NotificationProps {
  type?: NotificationType;
  message: any;
  duration?: number;
  onClose: () => void;
  animation?: keyof typeof Animation;
}

const icons = {
  success: <CheckCircle2 stroke="#58816e" className="w-4.5 h-4.5" />,
  info: <Lightbulb stroke="#4b6a9f" className="w-5.5 h-5.5" />,
  error: <AlertCircle stroke="#dc6266" className="w-5.5 h-5.5" />,
  warning: <AlertTriangle stroke="#dfa00a" className="w-5.5 h-5.5" />,
};

const Notification: React.FC<NotificationProps> = ({
  type = "info",
  message,
  onClose,
  animation = "slide-down",
}) => {
  return (
    <div
      className={`notification ${type} ${animation} w-xs sm:w-md flex justify-between p-3`}
    >
      <div className="flex gap-3 items-center">
        {icons[type]}
        <span className="text-text-dark">{message}</span>
      </div>
      <X
        onClick={onClose}
        strokeWidth={1.8}
        className="ml-2 cursor-pointer text-[#9aa29b] w-4.5 h-4.5"
      />
    </div>
  );
};

export default Notification;
