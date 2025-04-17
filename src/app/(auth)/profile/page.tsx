"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEdit,
  FiSave,
  FiX,
  FiShield,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import { motion } from "framer-motion";
import ToastNotifications, { showToast } from "@/components/ToastNotificatons";
import PasswordInput from "@/components/PasswordInput";
import authService from "@/services/authService";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { startLoading, stopLoading } = useLoading();

  // Estados para informações do perfil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Estados para alteração de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Estatísticas do usuário (dados fictícios, poderiam vir da API)
  const [userStats, setUserStats] = useState({
    memberSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 90 dias atrás
    transactionsCount: 145,
    categoriesCount: 8,
    lastLogin: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000
    ).toLocaleDateString("pt-BR"), // 2 dias atrás
  });

  // Carregar dados do usuário quando o componente montar
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    startLoading();

    try {
      // Aqui você chamaria o serviço para atualizar os dados do perfil
      // Exemplo: await authService.updateProfile(name, email);

      // Simulação de atualização bem-sucedida
      await new Promise((resolve) => setTimeout(resolve, 800));

      showToast("Perfil atualizado com sucesso!", "success");
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      showToast(error.message || "Falha ao atualizar o perfil", "error");
    } finally {
      stopLoading();
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validações
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    startLoading();

    try {
      // Aqui você chamaria o serviço para atualizar a senha
      // Exemplo: await authService.changePassword(currentPassword, newPassword);

      // Simulação de atualização bem-sucedida
      await new Promise((resolve) => setTimeout(resolve, 800));

      showToast("Senha alterada com sucesso!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      setPasswordError(error.message || "Falha ao alterar a senha");
    } finally {
      stopLoading();
    }
  };

  const cancelProfileEdit = () => {
    // Restaurar valores originais
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
    setIsEditingProfile(false);
  };

  const cancelPasswordChange = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setIsChangingPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ToastNotifications />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mr-4 shadow-md">
              <FiUser className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Meu Perfil</h2>
              <p className="text-gray-400">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          {/* Informações do Perfil */}
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6"
            >
              <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-700 flex items-center">
                <FiUser className="mr-2 text-purple-400" /> Informações Pessoais
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="ml-auto text-purple-400 hover:text-purple-300 p-1.5 hover:bg-purple-900/30 rounded-lg"
                    title="Editar perfil"
                  >
                    <FiEdit size={18} />
                  </button>
                )}
              </h3>

              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Nome Completo
                    </label>
                    <div className="flex items-center bg-gray-700 rounded-lg border border-gray-600 px-3 py-2">
                      <FiUser className="text-gray-400 mr-2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent border-none w-full text-white focus:outline-none"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Email
                    </label>
                    <div className="flex items-center bg-gray-700 rounded-lg border border-gray-600 px-3 py-2">
                      <FiMail className="text-gray-400 mr-2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent border-none w-full text-white focus:outline-none"
                        placeholder="seu@email.com"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelProfileEdit}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <FiX className="inline mr-1" /> Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <FiSave className="inline mr-1" /> Salvar Alterações
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center py-2">
                    <FiUser className="text-purple-400 mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Nome</p>
                      <p className="font-medium">{name || "Não informado"}</p>
                    </div>
                  </div>

                  <div className="flex items-center py-2">
                    <FiMail className="text-purple-400 mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium">{email}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Seção de Alteração de Senha */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-700 flex items-center">
                <FiLock className="mr-2 text-purple-400" /> Segurança
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="ml-auto text-purple-400 hover:text-purple-300 p-1.5 hover:bg-purple-900/30 rounded-lg"
                    title="Alterar senha"
                  >
                    <FiEdit size={18} />
                  </button>
                )}
              </h3>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordChange}>
                  {passwordError && (
                    <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                      {passwordError}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Senha Atual
                    </label>
                    <PasswordInput
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Nova Senha
                    </label>
                    <PasswordInput
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Confirmar Nova Senha
                    </label>
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelPasswordChange}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <FiX className="inline mr-1" /> Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <FiSave className="inline mr-1" /> Alterar Senha
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center py-2">
                    <FiLock className="text-purple-400 mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Senha</p>
                      <p className="font-medium">••••••••</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mt-2">
                    Para sua segurança, recomendamos alterar sua senha
                    periodicamente e utilizar uma combinação de letras, números
                    e caracteres especiais.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Estatísticas e Atividades */}
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6"
            >
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700 flex items-center">
                <FiShield className="mr-2 text-purple-400" /> Seu Perfil
              </h3>

              <div className="space-y-4">
                <div className="flex items-center py-2">
                  <FiCalendar className="text-purple-400 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-400">Membro desde</p>
                    <p className="font-medium">{userStats.memberSince}</p>
                  </div>
                </div>

                <div className="flex items-center py-2">
                  <FiRefreshCw className="text-purple-400 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-400">Último acesso</p>
                    <p className="font-medium">{userStats.lastLogin}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-6 shadow-lg w-full"
            >
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700">
                Estatísticas
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm text-gray-400">Total de Transações</h4>
                  <p className="text-2xl font-bold text-purple-400">
                    {userStats.transactionsCount}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm text-gray-400">Categorias Criadas</h4>
                  <p className="text-2xl font-bold text-purple-400">
                    {userStats.categoriesCount}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
