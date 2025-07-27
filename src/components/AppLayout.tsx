"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";
import Sidebar from "./Sidebar";
import ProtectedRoute from "./ProtectedRoute";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <ProtectedRoute>
      <div className="flex bg-gray-900 text-white min-h-screen">
        {!isMobile && <Sidebar />}

        {isMobile && isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <Sidebar isMobile={true} />
          </>
        )}

        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {isMobile && (
            <header className="bg-gray-800 py-3 px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center min-w-0">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-sm font-bold">Z</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent truncate">
                  Zentavo
                </h1>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </header>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AppLayout;
