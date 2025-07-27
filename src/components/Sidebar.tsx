"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDollarSign,
  FiUploadCloud,
  FiUser,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiTag,
  FiPieChart,
} from "react-icons/fi";

interface SidebarProps {
  isMobile?: boolean;
  className?: string;
}

const Sidebar = ({ isMobile = false, className = "" }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: <FiPieChart />, path: "/dashboard" },
    { name: "Gastos Mensais", icon: <FiDollarSign />, path: "/expenses" },
    { name: "Categorias", icon: <FiTag />, path: "/categories" },
    { name: "Importar CSV", icon: <FiUploadCloud />, path: "/import" },
  ];

  const bottomMenuItems = [
    { name: "Meu Perfil", icon: <FiUser />, path: "/profile" },
  ];

  const isActiveLink = (path: string) => pathname === path;

  useEffect(() => {
    if (isMobile) {
      const handleRouteChange = () => {
        return () => {
          document.body.style.overflow = "";
        };
      };

      document.body.style.overflow = "hidden";

      return handleRouteChange();
    }
  }, [isMobile]);

  return (
    <motion.aside
      initial={isMobile ? { x: "-100%" } : false}
      animate={{
        width: isCollapsed ? "5rem" : "16rem",
        x: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`
        bg-gray-800 relative
        flex flex-col
        ${isMobile ? "fixed z-20 shadow-xl h-full w-64 max-w-xs" : ""}
        flex-shrink-0 overflow-hidden
        ${className}
      `}
      style={isMobile ? { height: "100vh" } : {}}
    >
      {/* Botão de colapso - visível apenas quando expandido */}
      {!isCollapsed && (
        <div className="absolute top-5 right-0 z-20 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCollapsed(true)}
            className="bg-purple-600 p-1.5 rounded-l-full text-white shadow-lg hover:bg-purple-700 transition-all"
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            <FiChevronLeft size={16} />
          </motion.button>
        </div>
      )}

      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center px-4" : "px-6"
        } py-6`}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center shadow-md cursor-pointer"
          onClick={() => isCollapsed && setIsCollapsed(false)}
          title={isCollapsed ? "Expandir menu" : ""}
        >
          <span className="text-xl font-bold">Z</span>
        </motion.div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="ml-3 text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent"
            >
              Zentavo
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`
              flex items-center py-3 my-1
              ${isCollapsed ? "justify-center px-2" : "px-3"} 
              ${
                isActiveLink(item.path)
                  ? "bg-purple-600/20 text-purple-300 border-l-4 border-purple-500"
                  : "text-gray-300 hover:bg-gray-700/50 hover:text-purple-300 border-l-4 border-transparent"
              }
              rounded-lg font-medium transition-all duration-200
            `}
            title={isCollapsed ? item.name : ""}
          >
            <motion.span
              whileHover={{ scale: 1.2 }}
              className={`${isCollapsed ? "text-xl" : "mr-3"}`}
            >
              {item.icon}
            </motion.span>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>

      <div
        className={`border-t border-gray-700/50 pt-4 mt-auto mb-6 ${
          isCollapsed ? "px-4" : "px-6"
        }`}
      >
        {bottomMenuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`
              flex items-center py-3 my-1
              ${isCollapsed ? "justify-center px-2" : "px-3"} 
              ${
                isActiveLink(item.path)
                  ? "bg-purple-600/20 text-purple-300 border-l-4 border-purple-500"
                  : "text-gray-300 hover:bg-gray-700/50 hover:text-purple-300 border-l-4 border-transparent"
              }
              rounded-lg font-medium transition-all duration-200
            `}
            title={isCollapsed ? item.name : ""}
          >
            <motion.span
              whileHover={{ scale: 1.2 }}
              className={`${isCollapsed ? "text-xl" : "mr-3"}`}
            >
              {item.icon}
            </motion.span>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className={`
            flex items-center py-3 w-full my-1
            ${isCollapsed ? "justify-center px-2" : "px-3"} 
            text-gray-300 hover:bg-red-600/20 hover:text-red-400 border-l-4 border-transparent hover:border-red-500
            rounded-lg font-medium transition-all duration-200
          `}
          title={isCollapsed ? "Sair" : ""}
        >
          <motion.span
            whileHover={{ scale: 1.2 }}
            className={`${isCollapsed ? "text-xl" : "mr-3"}`}
          >
            <FiLogOut />
          </motion.span>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
