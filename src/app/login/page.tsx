"use client";

import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
