"use client";

import React from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { AnimatePresence, motion } from "framer-motion";
import { FiLoader } from "react-icons/fi";

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-800 p-6 rounded-lg shadow-xl flex items-center"
          >
            <FiLoader className="animate-spin text-purple-500 mr-3" size={24} />
            <p className="text-white font-medium">Carregando...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
