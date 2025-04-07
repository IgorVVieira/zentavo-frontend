"use client";

import { useState } from "react";
import Link from "next/link";
import { FiPieChart, FiDollarSign, FiUploadCloud, FiSettings, FiUser, FiLogOut } from "react-icons/fi";
import ExpenseChart from "@/components/charts/ExpenseChart";
import BalanceChart from "@/components/charts/BalanceChart";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  
  const expenseData = [
    { name: "Alimentação", value: 1250.80, color: "#EF4444" },
    { name: "Moradia", value: 850.00, color: "#F59E0B" },
    { name: "Transporte", value: 320.50, color: "#3B82F6" },
    { name: "Entretenimento", value: 275.00, color: "#8B5CF6" },
    { name: "Assinaturas", value: 149.00, color: "#EC4899" },
  ];

  const balanceData = [
    { month: "Out", income: 4200.00, expenses: 2800.00, balance: 1400.00 },
    { month: "Nov", income: 4300.00, expenses: 3100.00, balance: 1200.00 },
    { month: "Dez", income: 5200.00, expenses: 3500.00, balance: 1700.00 },
    { month: "Jan", income: 4100.00, expenses: 2950.00, balance: 1150.00 },
    { month: "Fev", income: 4300.00, expenses: 2750.00, balance: 1550.00 },
    { month: "Mar", income: 4650.00, expenses: 2845.30, balance: 1804.70 },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white flex">
        {/* Sidebar */}
        <aside className={`bg-gray-800 w-64 py-6 px-6 flex flex-col transition-all duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed h-full z-10 md:relative`}>
          <div className="flex items-center mb-10">
            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center mr-3">
              <span className="text-xl font-bold">Z</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Zentavo
            </h1>
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link href="/" className="flex items-center py-3 px-3 text-purple-300 hover:bg-gray-700 rounded-lg font-medium bg-gray-700">
                  <FiPieChart className="mr-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="flex items-center py-3 px-3 text-gray-300 hover:bg-gray-700 rounded-lg font-medium">
                  <FiDollarSign className="mr-3" />
                  Transações
                </Link>
              </li>
              <li>
                <Link href="/import" className="flex items-center py-3 px-3 text-gray-300 hover:bg-gray-700 rounded-lg font-medium">
                  <FiUploadCloud className="mr-3" />
                  Importar CSV
                </Link>
              </li>
              <li>
                <Link href="/settings" className="flex items-center py-3 px-3 text-gray-300 hover:bg-gray-700 rounded-lg font-medium">
                  <FiSettings className="mr-3" />
                  Configurações
                </Link>
              </li>
            </ul>
          </nav>

          <div className="border-t border-gray-700 pt-4 mt-6">
            <Link href="/profile" className="flex items-center py-3 px-3 text-gray-300 hover:bg-gray-700 rounded-lg font-medium">
              <FiUser className="mr-3" />
              Meu Perfil
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Navigation */}
          <header className="bg-gray-800 px-4 py-4 flex items-center justify-between md:justify-end">
            <button
              className="text-white md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center">
              <span className="bg-purple-600 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                {user?.name?.charAt(0) || 'U'}
              </span>
              <span className="text-sm">{user?.name || 'Usuário'}</span>
              <button 
                onClick={logout}
                className="ml-4 text-gray-400 hover:text-white"
                title="Sair"
              >
                <FiLogOut />
              </button>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="px-6 py-6">
            <h2 className="text-2xl font-bold mb-6">Dashboard Financeiro</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 px-6 py-6 rounded-lg border-l-4 border-purple-600">
                <p className="text-sm text-gray-400">Saldo Atual</p>
                <p className="text-2xl font-bold">R$ 12.580,45</p>
                <p className="text-green-400 text-sm">+2,5% este mês</p>
              </div>
              <div className="bg-gray-800 px-6 py-6 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-gray-400">Receitas</p>
                <p className="text-2xl font-bold">R$ 4.652,00</p>
                <p className="text-green-400 text-sm">+12% este mês</p>
              </div>
              <div className="bg-gray-800 px-6 py-6 rounded-lg border-l-4 border-red-500">
                <p className="text-sm text-gray-400">Despesas</p>
                <p className="text-2xl font-bold">R$ 2.845,30</p>
                <p className="text-red-400 text-sm">+8% este mês</p>
              </div>
              <div className="bg-gray-800 px-6 py-6 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-400">Economias</p>
                <p className="text-2xl font-bold">R$ 1.806,70</p>
                <p className="text-blue-400 text-sm">38,8% da receita</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 px-6 py-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
                <div className="aspect-square bg-gray-700 rounded-lg px-4 py-4">
                  <ExpenseChart data={expenseData} />
                </div>
              </div>
              <div className="bg-gray-800 px-6 py-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Balanço Mensal</h3>
                <div className="aspect-square bg-gray-700 rounded-lg px-4 py-4">
                  <BalanceChart data={balanceData} />
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-800 px-6 py-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Transações Recentes</h3>
                <Link href="/transactions" className="text-purple-400 hover:text-purple-300 text-sm">
                  Ver Todas
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-700">
                      <th className="pb-3 font-medium">Descrição</th>
                      <th className="pb-3 font-medium">Categoria</th>
                      <th className="pb-3 font-medium">Data</th>
                      <th className="pb-3 font-medium text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-3">Supermercado Extra</td>
                      <td>
                        <span className="px-2 py-1 text-xs rounded-full bg-red-900 text-red-300">
                          Alimentação
                        </span>
                      </td>
                      <td>24/03/2025</td>
                      <td className="text-red-400 text-right">-R$ 256,78</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3">Salário</td>
                      <td>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300">
                          Receita
                        </span>
                      </td>
                      <td>20/03/2025</td>
                      <td className="text-green-400 text-right">+R$ 4.500,00</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3">Netflix</td>
                      <td>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-900 text-purple-300">
                          Assinaturas
                        </span>
                      </td>
                      <td>19/03/2025</td>
                      <td className="text-red-400 text-right">-R$ 39,90</td>
                    </tr>
                    <tr>
                      <td className="py-3">Farmácia</td>
                      <td>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-300">
                          Saúde
                        </span>
                      </td>
                      <td>18/03/2025</td>
                      <td className="text-red-400 text-right">-R$ 87,50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}