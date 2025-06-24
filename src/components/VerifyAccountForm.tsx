"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/ToastNotificatons";
import { useLoading } from "@/contexts/LoadingContext";
import authService from "@/services/authService";
import Loading from "@/components/Loading";
import { FiMail, FiCheck, FiRefreshCw } from "react-icons/fi";

export default function VerifyAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startLoading, stopLoading } = useLoading();

  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Extrair userId da URL
  useEffect(() => {
    const userIdParam = searchParams.get("userId");
    if (userIdParam) {
      setUserId(userIdParam);
    } else {
      setError("ID do usuário não encontrado na URL.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    startLoading();

    // Validação básica
    if (!token.trim()) {
      setError("Por favor, insira o código de verificação.");
      setIsLoading(false);
      stopLoading();
      return;
    }

    if (!userId) {
      setError("ID do usuário não encontrado.");
      setIsLoading(false);
      stopLoading();
      return;
    }

    // Garantir que temos exatamente 6 dígitos
    const cleanToken = token.replace(/\D/g, "");
    if (cleanToken.length !== 6) {
      setError("O código deve ter exatamente 6 dígitos.");
      setIsLoading(false);
      stopLoading();
      return;
    }

    try {
      await authService.activateAccount(cleanToken, userId);

      setSuccess(true);
      showToast("Conta ativada com sucesso!", "success");
    } catch (err: any) {
      console.error("Erro ao verificar conta:", err);
      setError(err.message || "Código inválido ou expirado. Tente novamente.");
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  const handleResendCode = async () => {
    if (!userId) {
      setError("ID do usuário não encontrado.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      await authService.resendActivationCode(userId);
      showToast("Novo código enviado para seu email!", "success");
    } catch (err: any) {
      console.error("Erro ao reenviar código:", err);
      setError(
        err.message || "Não foi possível reenviar o código. Tente novamente."
      );
    } finally {
      setIsResending(false);
    }
  };

  const formatToken = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, "");

    // Limita a 6 dígitos
    const limited = numbers.slice(0, 6);

    // Adiciona espaços a cada 3 dígitos para melhor visualização
    return limited.replace(/(.{3})/g, "$1 ").trim();
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatToken(e.target.value);
    setToken(formatted.replace(/\s/g, "")); // Remove espaços para armazenar apenas números
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
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
            <p className="text-gray-300">Verificação de Conta</p>
          </div>

          {success ? (
            <div className="bg-green-900/30 border border-green-500 text-green-300 px-6 py-6 rounded-lg mb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
                  <FiCheck size={32} className="text-white" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">
                Conta ativada com sucesso!
              </h3>
              <p className="mb-4">
                Sua conta foi verificada e ativada. Agora você pode fazer login
                e começar a usar o Zentavo.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200"
              >
                Ir para o Login
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <FiMail size={32} className="text-purple-400" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Verifique seu email
                </h2>
                <p className="text-gray-300 text-sm">
                  Enviamos um código de 6 dígitos para o email cadastrado.
                  Digite o código abaixo para ativar sua conta.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                  </div>
                )}

                <div className="mb-6">
                  <label
                    htmlFor="token"
                    className="block text-gray-300 mb-2 text-sm font-medium"
                  >
                    Código de Verificação
                  </label>
                  <input
                    id="token"
                    type="text"
                    value={formatToken(token)}
                    onChange={handleTokenChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="000 000"
                    maxLength={7} // 6 dígitos + 1 espaço
                    autoComplete="off"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    Digite o código de 6 dígitos enviado por email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading || !token || token.replace(/\D/g, "").length < 6
                  }
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loading size="small" text="Verificando..." show={true} />
                  ) : (
                    "Verificar Conta"
                  )}
                </button>
              </form>

              {/* Opção para reenviar código */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm mb-3">
                  Não recebeu o código?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center justify-center mx-auto disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-400 mr-2"></div>
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="mr-1" size={16} />
                      Reenviar código
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Já tem sua conta ativada?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300"
              >
                Fazer login
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
