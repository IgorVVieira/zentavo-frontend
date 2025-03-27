// src/app/layout.tsx
import { Inter } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ToastNotifications from "@/components/ToastNotificatons";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <ToastNotifications />
      </body>
    </html>
  );
}
