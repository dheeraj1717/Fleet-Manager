import Notification, { NotificationProps } from "@/components/Notification";
import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

type Position =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

interface NotificationWithId extends NotificationProps {
  id: string;
}

const useNotification = (position: Position = "top-center") => {
  const [notifications, setNotifications] = useState<NotificationWithId[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  };

  const triggerNotification = useCallback(
    ({
      duration = 3000,
      ...rest
    }: Omit<NotificationProps, "onClose"> & { duration?: number }) => {
      const id = uuidv4();
      const newNotification: NotificationWithId = {
        ...rest,
        id,
        duration,
        onClose: () => removeNotification(id),
      };

      setNotifications((prev) => [newNotification, ...prev]);

      timersRef.current[id] = setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    []
  );

  const NotificationComponent = (
    <div className={`fixed z-50 space-y-3 ${position}`}>
      {notifications.map((n) => (
        <Notification key={n.id} {...n} />
      ))}
    </div>
  );

  return { triggerNotification, NotificationComponent };
};

export default useNotification;
