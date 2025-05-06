"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/components/ToastNotificatons";
import { useLoading } from "@/contexts/LoadingContext";
import PasswordInput from "@/components/PasswordInput";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/expenses");
    }

    const cadastroStatus = searchParams.get("cadastro");
    if (cadastroStatus === "sucesso") {
      setSuccess("Cadastro realizado com sucesso! Faça login para continuar.");
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    startLoading();

    try {
      const success = await login(email, password);

      if (success) {
        showToast("Login realizado com sucesso!", "success");
        router.push("/expenses");
      } else {
        setError(
          "Email ou senha incorretos. Por favor, verifique suas credenciais."
        );
      }
    } catch (err: any) {
      console.error("Erro durante o login:", err);
      setError(err.message || "Erro ao tentar fazer login. Tente novamente.");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl p-4 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                <span className="text-2xl font-bold">Z</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Zentavo
              </h1>
            </div>
            <p className="text-gray-300">Gestão financeira inteligente</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900/30 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {success}
              </div>
            )}

            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-300 mb-2 text-sm font-medium"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-gray-300 text-sm font-medium"
                >
                  Senha
                </label>
                <Link
                  href="/recovery-password"
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center mb-6">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-300"
              >
                Lembrar de mim
              </label>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center"
            >
              {authLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-purple-400 hover:text-purple-300"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>
            &copy; {new Date().getFullYear()} Zentavo. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
