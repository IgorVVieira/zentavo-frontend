"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLoading } from "@/contexts/LoadingContext";

interface ILoadingProps {
  fullScreen?: boolean;
  text?: string;
  size?: "small" | "medium" | "large";
  show?: boolean;
}

const Loading: React.FC<ILoadingProps> = ({
  fullScreen = false,
  text = "Carregando...",
  size = "medium",
  show,
}) => {
  const { isLoading: contextLoading } = useLoading();

  const isVisible = show !== undefined ? show : contextLoading;

  if (!isVisible) return null;

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "h-8 w-8 border-2";
      case "large":
        return "h-16 w-16 border-3";
      default:
        return "h-12 w-12 border-2";
    }
  };

  const sizeClasses = getSizeClasses();

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-50">
        <div className="flex flex-col items-center p-6 rounded-lg bg-gray-800 shadow-xl">
          <motion.div
            className={`rounded-full border-t-purple-500 border-b-purple-500 border-r-transparent border-l-transparent ${sizeClasses}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-white font-medium text-lg">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 w-full">
      <motion.div
        className={`rounded-full border-t-purple-500 border-b-purple-500 border-r-transparent border-l-transparent ${sizeClasses}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="mt-4 text-gray-300">{text}</p>
    </div>
  );
};

export default Loading;
