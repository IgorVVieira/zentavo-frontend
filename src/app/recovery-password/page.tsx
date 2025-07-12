"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/ToastNotificatons";
import { useLoading } from "@/contexts/LoadingContext";
import ToastNotifications from "@/components/ToastNotificatons";
import authService from "@/services/authService";
import Loading from "@/components/Loading";

export default function RecuperarSenha() {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    startLoading();

    try {
      // Implementação da chamada para recuperar senha
      await authService.requestPasswordReset(email);

      // Como o serviço ainda não está implementado, estamos simulando uma resposta de sucesso
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      showToast(
        "Instruções de recuperação enviadas para seu email!",
        "success"
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Não foi possível processar sua solicitação. Tente novamente."
      );
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <ToastNotifications />

      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 animate-fadeIn">
          {/* Logo e título */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                <span className="text-2xl font-bold">Z</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Zentavo
              </h1>
            </div>
            <p className="text-gray-300">Recuperação de Senha</p>
          </div>

          {success ? (
            <div className="bg-green-900/30 border border-green-500 text-green-300 px-6 py-6 rounded-lg mb-6 text-center">
              <h3 className="text-lg font-medium mb-2">Email enviado!</h3>
              <p className="mb-4">
                Enviamos um link de recuperação para <strong>{email}</strong>.
                Verifique sua caixa de entrada e siga as instruções para
                redefinir sua senha.
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Se não encontrar o email, verifique sua pasta de spam ou lixo
                eletrônico.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200"
              >
                Voltar para o Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Esqueceu sua senha?
                </h2>
                <p className="text-gray-300 mb-4">
                  Insira seu endereço de email e enviaremos instruções para
                  redefinir sua senha.
                </p>

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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loading size="small" text="Enviando..." show={true} />
                ) : (
                  "Enviar instruções"
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Lembrou sua senha?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300"
              >
                Voltar para o login
              </Link>
            </p>
          </div>
        </div>

        {/* Rodapé */}
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
