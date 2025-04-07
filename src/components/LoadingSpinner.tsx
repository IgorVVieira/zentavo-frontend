"use client";

import React from "react";
import { useLoading } from "@/contexts/LoadingContext";

const LoadingSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 px-8 py-6 rounded-lg shadow-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mr-4"></div>
        <p className="text-white font-medium text-lg">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
