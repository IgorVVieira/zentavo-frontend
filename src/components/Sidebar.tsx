// src/components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FiPieChart,
  FiDollarSign,
  FiUploadCloud,
  FiSettings,
  FiUser,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiHome,
  FiBarChart2,
  FiCreditCard,
  FiTag,
  FiTarget,
} from "react-icons/fi";

interface SidebarProps {
  isMobile?: boolean;
}

const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Gastos Mensais", icon: <FiDollarSign />, path: "/expenses" },
    { name: "Categorias", icon: <FiTag />, path: "/categories" },
    { name: "Importar CSV", icon: <FiUploadCloud />, path: "/import" },
  ];

  const bottomMenuItems = [
    { name: "Meu Perfil", icon: <FiUser />, path: "/profile" },
  ];

  const isActiveLink = (path: string) => pathname === path;

  return (
    <aside
      className={`
        ${isCollapsed ? "w-20" : "w-64"} 
        bg-gray-800 h-screen 
        flex flex-col transition-all duration-300 ease-in-out
        ${isMobile ? "fixed z-20 shadow-xl" : ""} 
        flex-shrink-0 
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top- right-[-12px] bg-purple-600 p-1 rounded-full text-white z-10 shadow-md hover:bg-purple-700 transition-all"
      >
        {isCollapsed ? <FiMenu size={18} /> : <FiChevronLeft size={18} />}
      </button>

      {/* Logo */}
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center px-4" : "px-6"
        } py-6`}
      >
        <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
          <span className="text-xl font-bold">Z</span>
        </div>
        {!isCollapsed && (
          <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Zentavo
          </h1>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`
              flex items-center py-3 
              ${isCollapsed ? "justify-center px-2" : "px-3"} 
              ${
                isActiveLink(item.path)
                  ? "bg-gray-700 text-purple-300"
                  : "text-gray-300 hover:bg-gray-700 hover:text-purple-300"
              }
              rounded-lg font-medium transition-colors duration-200
            `}
            title={isCollapsed ? item.name : ""}
          >
            <span className={`${isCollapsed ? "text-xl" : "mr-3"}`}>
              {item.icon}
            </span>
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div
        className={`border-t border-gray-700 pt-4 mb-6 ${
          isCollapsed ? "px-4" : "px-6"
        }`}
      >
        {bottomMenuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`
              flex items-center py-3 
              ${isCollapsed ? "justify-center px-2" : "px-3"} 
              ${
                isActiveLink(item.path)
                  ? "bg-gray-700 text-purple-300"
                  : "text-gray-300 hover:bg-gray-700 hover:text-purple-300"
              }
              rounded-lg font-medium transition-colors duration-200
            `}
            title={isCollapsed ? item.name : ""}
          >
            <span className={`${isCollapsed ? "text-xl" : "mr-3"}`}>
              {item.icon}
            </span>
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}

        {/* Logout Button */}
        <button
          onClick={logout}
          className={`
            flex items-center py-3 w-full
            ${isCollapsed ? "justify-center px-2" : "px-3"} 
            text-gray-300 hover:bg-gray-700 hover:text-red-400
            rounded-lg font-medium transition-colors duration-200
          `}
          title={isCollapsed ? "Sair" : ""}
        >
          <span className={`${isCollapsed ? "text-xl" : "mr-3"}`}>
            <FiLogOut />
          </span>
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
