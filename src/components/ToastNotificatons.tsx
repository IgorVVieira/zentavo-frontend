"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Tipos de notificação
export type NotificationType = "success" | "error" | "info" | "warning";

// Função para mostrar notificações (exportada para ser usada em outros componentes)
export const showToast = (message: string, type: NotificationType = "info") => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warning":
      toast.warning(message);
      break;
    case "info":
    default:
      toast.info(message);
      break;
  }
};

// Componente de contêiner para o Toast
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
      //   theme="dark"
    />
  );
};

export default ToastNotifications;
