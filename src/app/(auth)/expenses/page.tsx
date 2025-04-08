"use client";

import { useState, useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
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
  FiEdit,
  FiX,
} from "react-icons/fi";
import ToastNotifications, { showToast } from "@/components/ToastNotificatons";
import transactionService, {
  ExpenseItem,
  TransactionMethod,
} from "@/services/transactionService";
import categoryService, { Category } from "@/services/categoryService";
import Modal from "react-modal";

if (typeof window !== "undefined") {
  const nextRoot = document.getElementById("__next");
  if (nextRoot) {
    Modal.setAppElement("#__next");
  } else {
    Modal.setAppElement("body");
  }
}

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

interface EditModalProps {
  isOpen: boolean;
  expense: ExpenseItem | null;
  onClose: () => void;
  onSave: (
    id: string,
    updates: { description: string; categoryId: string }
  ) => void;
  categories: Category[];
}

const EditTransactionModal = ({
  isOpen,
  expense,
  onClose,
  onSave,
  categories,
}: EditModalProps) => {
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setCategoryId(expense.category.id || "");
    }
  }, [expense]);

  if (!expense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(expense.id, { description, categoryId });
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

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
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">-- Selecione uma categoria --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <div className="flex items-center mb-4">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{
                  backgroundColor:
                    selectedCategory?.color ||
                    expense.category.color ||
                    "#6B7280",
                }}
              ></div>
              <span className="text-gray-300">
                {selectedCategory
                  ? selectedCategory.name
                  : expense.category.name || "Sem categoria"}
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
  const { startLoading, stopLoading } = useLoading();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Mês atual (1-12)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(
    null
  );

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

  const currentYearJs = new Date().getFullYear();
  const years = [
    currentYearJs - 3,
    currentYearJs - 2,
    currentYearJs - 1,
    currentYearJs,
    currentYearJs + 1,
  ];

  // Tradução dos métodos de pagamento para português
  const translateMethod = (method?: string): string => {
    // console.log("Método de pagamento:", method);
    if (!method) return "Desconhecido";

    const methodTranslations: Record<string, string> = {
      [TransactionMethod.PIX]: "Pix",
      [TransactionMethod.DEBIT]: "Débito",
      [TransactionMethod.TRANSFER]: "Transferência",
      [TransactionMethod.CARD_PAYMENT]: "Pagamento de Cartão",
    };

    return methodTranslations[method] || method;
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentYear(newYear);
  };

  // Carregar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    fetchCategories();
  }, []);

  // Carregar transações
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsTableLoading(true);
      startLoading();
      try {
        const data = await transactionService.getMonthlyTransactions(
          currentMonth,
          currentYear
        );
        console.log(data);
        setExpenses(data);
      } catch (error: any) {
        console.error("Erro ao buscar transações:", error);
        showToast(error.message || "Erro ao carregar as transações", "error");
        setExpenses([]);
      } finally {
        setIsTableLoading(false);
        stopLoading();
      }
    };

    fetchTransactions();
  }, [currentMonth, currentYear, startLoading, stopLoading]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const totalIncome = expenses
    .filter((expense) => expense.amount > 0)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpenses = expenses
    .filter(
      (expense) =>
        expense.amount < 0 && expense.description !== "Aplicação RDB"
    )
    .reduce((sum, expense) => sum + expense.amount, 0);

  const balance = totalIncome + totalExpenses;

  const openEditModal = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSave = async (
    id: string,
    updates: { description: string; categoryId: string }
  ) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) {
      closeEditModal();
      return;
    }

    startLoading();
    try {
      // Enviar atualização para a API e obter a transação atualizada
      const updatedTransaction = await transactionService.updateTransaction(
        id,
        {
          description: updates.description,
          categoryId: updates.categoryId || null,
        }
      );

      // Atualizar o estado local com os dados retornados pela API
      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense.id === id ? updatedTransaction : expense
        )
      );

      showToast("Transação atualizada com sucesso!", "success");
    } catch (error: any) {
      console.error("Erro ao atualizar transação:", error);
      showToast(
        error.message || "Erro ao atualizar transação. Tente novamente.",
        "error"
      );
    } finally {
      closeEditModal();
      stopLoading();
    }
  };

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
      columnHelper.accessor((row) => row.category.name, {
        id: "category",
        header: "Categoria",
        cell: (info) => {
          const category = info.row.original.category;
          return (
            <span
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: category.color || "#6B7280",
                color: "#FFFFFF",
              }}
            >
              {category.name || "Outros"}
            </span>
          );
        },
      }),
      columnHelper.accessor("method", {
        header: "Método",
        cell: (info) => {
          const method = info.getValue();
          return (
            <span className="text-gray-300">{translateMethod(method)}</span>
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
              {formatCurrency(Math.abs(amount))}
            </span>
          );
        },
        sortingFn: "basic",
      }),
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
    [categories]
  );

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

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentMonth(newMonth);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white flex">
        <div className="flex-1">
          <ToastNotifications />

          <EditTransactionModal
            isOpen={isModalOpen}
            expense={editingExpense}
            onClose={closeEditModal}
            onSave={handleSave}
            categories={categories}
          />

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
              <div className="bg-gray-800 px-6 py-6 rounded-lg border-l-4 border-green-500 flex-1">
                <p className="text-sm text-gray-400">Total de entradas</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-sm text-gray-400">Receitas do mês</p>
              </div>

              <div className="bg-gray-800 px-6 py-6 rounded-lg border-l-4 border-red-500 flex-1">
                <p className="text-sm text-gray-400">Total de saídas</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(Math.abs(totalExpenses))}
                </p>
                <p className="text-sm text-gray-400">Despesas do mês</p>
              </div>

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
                    {isTableLoading ? (
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
