"use client";

import { useState, useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import {
  FiArrowUp,
  FiArrowDown,
  FiChevronsUp,
  FiEdit2,
  FiX,
  FiEdit,
} from "react-icons/fi";
import ToastNotifications, { showToast } from "@/components/ToastNotificatons";
import transactionService, { ExpenseItem } from "@/services/transactionService";
import Modal from "react-modal";

if (typeof window !== "undefined") {
  const nextRoot = document.getElementById("__next");
  if (nextRoot) {
    Modal.setAppElement("#__next");
  } else {
    // Fallback para o body (funciona com App Router)
    Modal.setAppElement("body");
  }
}

// Estilo personalizado para o modal
const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#1f2937", // bg-gray-800
    borderRadius: "0.5rem",
    border: "1px solid #374151", // border-gray-700
    padding: "1.5rem",
    maxWidth: "500px",
    width: "100%",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
  },
};

// Mapeamento de categorias para cores
const categoryColors: Record<string, string> = {
  Alimentação: "bg-red-900 text-red-300",
  Moradia: "bg-blue-900 text-blue-300",
  Transporte: "bg-yellow-900 text-yellow-300",
  Saúde: "bg-blue-900 text-blue-300",
  Entretenimento: "bg-purple-900 text-purple-300",
  Assinaturas: "bg-purple-900 text-purple-300",
  Utilidades: "bg-gray-700 text-gray-300",
  Pessoal: "bg-pink-900 text-pink-300",
  Receita: "bg-green-900 text-green-300",
  Outros: "bg-gray-700 text-gray-300",
};

// Função para formatar números como moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Componente Modal para edição unificada de dados
interface EditModalProps {
  isOpen: boolean;
  expense: ExpenseItem | null;
  onClose: () => void;
  onSave: (
    id: string,
    updates: { description: string; category: string }
  ) => void;
}

const EditTransactionModal = ({
  isOpen,
  expense,
  onClose,
  onSave,
}: EditModalProps) => {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  // Inicializar valores ao abrir o modal
  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setCategory(expense.category);
    }
  }, [expense]);

  if (!expense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(expense.id, { description, category });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Editar Transação"
    >
      <div className="text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Editar Transação</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <input
              autoFocus
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Descrição da transação"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Alimentação">Alimentação</option>
              <option value="Moradia">Moradia</option>
              <option value="Transporte">Transporte</option>
              <option value="Saúde">Saúde</option>
              <option value="Entretenimento">Entretenimento</option>
              <option value="Assinaturas">Assinaturas</option>
              <option value="Utilidades">Utilidades</option>
              <option value="Receita">Receita</option>
              <option value="Pessoal">Pessoal</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="pt-2">
            <div className="flex items-center mb-4">
              <div
                className={`w-4 h-4 rounded-full mr-2 ${
                  categoryColors[category]?.split(" ")[0] || "bg-gray-700"
                }`}
              ></div>
              <span
                className={
                  categoryColors[category]?.split(" ")[1] || "text-gray-300"
                }
              >
                Pré-visualização da categoria
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 ml-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default function ExpensesTable() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Mês atual (1-12)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);

  // Estados para o modal de edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(
    null
  );

  // Lista de meses
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Gera lista de anos (atual-3 até atual+1)
  const currentYearJs = new Date().getFullYear();
  const years = [
    currentYearJs - 3,
    currentYearJs - 2,
    currentYearJs - 1,
    currentYearJs,
    currentYearJs + 1,
  ];

  // Buscar dados da API quando o mês ou ano mudar
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // Buscar transações da API para o mês e ano selecionados
        const data = await transactionService.getMonthlyTransactions(
          currentMonth,
          currentYear
        );
        setExpenses(data);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
        showToast("Erro ao carregar as transações", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [currentMonth, currentYear]);

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Cálculo dos totais
  const totalIncome = expenses
    .filter((expense) => expense.type === "income")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpenses = expenses
    .filter((expense) => expense.type === "expense")
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calcular o saldo (entradas - saídas)
  const balance = totalIncome - totalExpenses;

  // Abrir modal de edição
  const openEditModal = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  // Fechar modal de edição
  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  // Função para simular chamada à API e atualizar localmente
  const handleSave = async (
    id: string,
    updates: { description: string; category: string }
  ) => {
    // Verificar se o valor mudou
    const expense = expenses.find((e) => e.id === id);
    if (
      !expense ||
      (expense.description === updates.description &&
        expense.category === updates.category)
    ) {
      closeEditModal();
      return;
    }

    try {
      // Simular atraso da API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 95% de chance de sucesso
      const success = Math.random() > 0.05;

      if (success) {
        // Atualizar localmente
        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) =>
            expense.id === id ? { ...expense, ...updates } : expense
          )
        );
        showToast("Transação atualizada com sucesso!", "success");
      } else {
        showToast("Erro ao atualizar transação. Tente novamente.", "error");
      }
    } catch (error) {
      showToast("Erro ao conectar com o servidor.", "error");
    } finally {
      closeEditModal();
    }
  };

  // Configuração das colunas da tabela
  const columnHelper = createColumnHelper<ExpenseItem>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Data",
        cell: (info) => formatDate(info.getValue()),
        sortingFn: "datetime",
      }),
      columnHelper.accessor("description", {
        header: "Descrição",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("category", {
        header: "Categoria",
        cell: (info) => {
          const category = info.getValue();
          return (
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                categoryColors[category] || "bg-gray-700 text-gray-300"
              }`}
            >
              {category}
            </span>
          );
        },
      }),
      columnHelper.accessor("type", {
        header: "Tipo",
        cell: (info) => {
          const value = info.getValue();
          return (
            <span
              className={value === "income" ? "text-green-400" : "text-red-400"}
            >
              {value === "income" ? "Receita" : "Despesa"}
            </span>
          );
        },
        sortingFn: "basic",
      }),
      columnHelper.accessor("amount", {
        header: "Valor",
        cell: (info) => {
          const amount = info.getValue();
          const type = info.row.original.type;
          return (
            <span
              className={type === "income" ? "text-green-400" : "text-red-400"}
            >
              {formatCurrency(amount)}
            </span>
          );
        },
        sortingFn: "basic",
      }),
      // Nova coluna de ações
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: (info) => {
          const expense = info.row.original;
          return (
            <div className="flex justify-center">
              <button
                onClick={() => openEditModal(expense)}
                className="p-2 bg-purple-600/20 text-purple-400 rounded-full hover:bg-purple-600/40 transition-colors"
                title="Editar transação"
              >
                <FiEdit size={16} />
              </button>
            </div>
          );
        },
      }),
    ],
    []
  );

  // Configuração da tabela com TanStack Table
  const table = useReactTable({
    data: expenses,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Manipuladores para os seletores de mês e ano
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentMonth(newMonth);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentYear(newYear);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white flex">
        {/* Main Content */}
        <div className="flex-1">
          {/* Componente React-Toastify */}
          <ToastNotifications />

          {/* Modal de Edição Unificado */}
          <EditTransactionModal
            isOpen={isModalOpen}
            expense={editingExpense}
            onClose={closeEditModal}
            onSave={handleSave}
          />

          {/* Expenses Table Content */}
          <main className="px-6 py-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gastos Mensais</h2>
              <div className="flex space-x-4">
                <select
                  value={currentMonth}
                  onChange={handleMonthChange}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={currentYear}
                  onChange={handleYearChange}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-6 mb-6">
              {/* Card de Entradas */}
              <div className="bg-gray-800 px-6 py-6 rounded-lg border-l-4 border-green-500 flex-1">
                <p className="text-sm text-gray-400">Total de entradas</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-sm text-gray-400">Receitas do mês</p>
              </div>

              {/* Card de Saídas */}
              <div className="bg-gray-800 px-6 py-6 rounded-lg border-l-4 border-red-500 flex-1">
                <p className="text-sm text-gray-400">Total de saídas</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="text-sm text-gray-400">Despesas do mês</p>
              </div>

              {/* Card de Saldo */}
              <div className="bg-gray-800 px-6 py-6 rounded-lg border-l-4 border-purple-500 flex-1">
                <p className="text-sm text-gray-400">Saldo do período</p>
                <p
                  className={`text-2xl font-bold ${
                    balance >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatCurrency(balance)}
                </p>
                <p className="text-sm text-gray-400">
                  {balance >= 0 ? "Positivo" : "Negativo"}
                </p>
              </div>
            </div>

            {/* TanStack Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr
                        key={headerGroup.id}
                        className="bg-gray-700 text-left text-sm"
                      >
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-3 font-medium"
                            onClick={header.column.getToggleSortingHandler()}
                            style={{
                              cursor: header.column.getCanSort()
                                ? "pointer"
                                : "default",
                            }}
                          >
                            <div className="flex items-center">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: (
                                  <FiArrowUp className="ml-2 text-purple-400" />
                                ),
                                desc: (
                                  <FiArrowDown className="ml-2 text-purple-400" />
                                ),
                              }[header.column.getIsSorted() as string] ?? null}
                              {header.column.getCanSort() &&
                                !header.column.getIsSorted() && (
                                  <span className="ml-2 text-gray-500">
                                    <FiChevronsUp size={14} />
                                  </span>
                                )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-4 py-16 text-center"
                        >
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                          </div>
                          <p className="mt-4 text-gray-400">
                            Carregando transações...
                          </p>
                        </td>
                      </tr>
                    ) : table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-700">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          Nenhuma transação encontrada para{" "}
                          {months[currentMonth - 1]} de {currentYear}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginação e resumo */}
              {table.getRowModel().rows.length > 0 && (
                <div className="px-4 py-3 bg-gray-700 border-t border-gray-600 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-400">
                      Mostrando {table.getRowModel().rows.length} de{" "}
                      {expenses.length} transações
                    </span>
                  </div>
                  <div className="text-gray-400">
                    <p>Clique no botão de edição para modificar os dados</p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
