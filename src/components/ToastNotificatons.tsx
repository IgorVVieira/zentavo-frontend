"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export enum NotificationType {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
  WARNING = "warning",
}

export const showToast = (
  message: string,
  type: NotificationType = NotificationType.INFO,
) => {
  switch (type) {
    case NotificationType.SUCCESS:
      toast.success(message);
      break;
    case NotificationType.ERROR:
      toast.error(message);
      break;
    case NotificationType.WARNING:
      toast.warning(message);
      break;
    case NotificationType.INFO:
    default:
      toast.info(message);
      break;
  }
};

const ToastNotifications = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
};

export default ToastNotifications;
