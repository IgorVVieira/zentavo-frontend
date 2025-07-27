import { Inter } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ToastNotifications from "@/components/ToastNotificatons";
import { LoadingProvider } from "@/contexts/LoadingContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <LoadingProvider>
          <AuthProvider>{children}</AuthProvider>
          <ToastNotifications />
        </LoadingProvider>
      </body>
    </html>
  );
}
