"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showToast, NotificationType } from "@/components/ToastNotificatons";
import { useLoading } from "@/contexts/LoadingContext";
import ToastNotifications from "@/components/ToastNotificatons";
import authService from "@/services/authService";
import PasswordInput from "@/components/PasswordInput";
import Loading from "@/components/Loading";

export default function RedefinirSenha() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const { startLoading, stopLoading } = useLoading();
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true); // Assume token válido inicialmente

  // Verificar token ao carregar a página
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setError("Link de redefinição de senha inválido ou expirado");
    }

    // Aqui poderíamos ter uma chamada para verificar o token na API
    // Por enquanto apenas simulamos que o token existe
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    startLoading();

    // Validação de senha
    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      stopLoading();
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      stopLoading();
      return;
    }

    try {
      await authService.resetPassword(token, senha);

      setSuccess(true);
      showToast("Senha redefinida com sucesso!", NotificationType.SUCCESS);
    } catch (err: any) {
      setError(
        err.message || "Não foi possível redefinir sua senha. Tente novamente.",
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
            <p className="text-gray-300">Redefinição de Senha</p>
          </div>

          {!isTokenValid ? (
            <div className="bg-red-900/30 border border-red-500 text-red-300 px-6 py-6 rounded-lg mb-6 text-center">
              <h3 className="text-lg font-medium mb-2">
                Link inválido ou expirado
              </h3>
              <p className="mb-4">
                O link de redefinição de senha é inválido ou já expirou.
              </p>
              <Link
                href="/recuperar-senha"
                className="w-full inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-200 text-center"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : success ? (
            <div className="bg-green-900/30 border border-green-500 text-green-300 px-6 py-6 rounded-lg mb-6 text-center">
              <h3 className="text-lg font-medium mb-2">
                Senha alterada com sucesso!
              </h3>
              <p className="mb-4">
                Sua senha foi redefinida. Agora você pode fazer login com sua
                nova senha.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200"
              >
                Ir para o Login
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
                  Criar nova senha
                </h2>
                <p className="text-gray-300 mb-4">
                  Escolha uma nova senha para sua conta.
                </p>

                <div className="mb-4">
                  <label
                    htmlFor="senha"
                    className="block text-gray-300 mb-2 text-sm font-medium"
                  >
                    Nova Senha
                  </label>
                  <PasswordInput
                    id="senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="confirmarSenha"
                    className="block text-gray-300 mb-2 text-sm font-medium"
                  >
                    Confirmar Nova Senha
                  </label>
                  <PasswordInput
                    id="confirmarSenha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loading
                    size="small"
                    text="Redefinindo senha..."
                    show={true}
                  />
                ) : (
                  "Redefinir Senha"
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
