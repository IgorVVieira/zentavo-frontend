import { Inter } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ToastNotifications from "@/components/ToastNotificatons";
import { LoadingProvider } from "@/contexts/LoadingContext";
import LoadingSpinner from "@/components/LoadingSpinner";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <LoadingProvider>
          <AuthProvider>{children}</AuthProvider>
          <ToastNotifications />
          <LoadingSpinner />
        </LoadingProvider>
      </body>
    </html>
  );
}
