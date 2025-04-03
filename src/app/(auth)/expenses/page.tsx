"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  FiCheck,
  FiX,
} from "react-icons/fi";
import ToastNotifications, { showToast } from "@/components/ToastNotificatons";
import transactionService, { ExpenseItem } from "@/services/transactionService";

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

export default function ExpensesTable() {
  const { user, logout } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Mês atual (1-12)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: "description" | "category";
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

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

  // Foca no input quando está editando
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingCell]);

  // Adicionar event listener para detectar cliques fora do input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editInputRef.current &&
        !editInputRef.current.contains(event.target as Node)
      ) {
        saveEdit();
      }
    };

    // Apenas adiciona o event listener se estiver editando
    if (editingCell) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingCell, editValue]);

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

  // Iniciar edição de uma célula
  const startEdit = (
    id: string,
    field: "description" | "category",
    value: string
  ) => {
    setEditingCell({ id, field });
    setEditValue(value);
  };

  // Cancelar edição
  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Simular chamada API para salvar a edição
  const mockApiCall = (
    id: string,
    field: string,
    value: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log(`API Call: Updating ${field} to ${value} for expense ${id}`);
      setTimeout(() => {
        // Simula 95% de chances de sucesso
        const success = Math.random() > 0.05;
        resolve(success);
      }, 500);
    });
  };

  // Salvar a edição
  const saveEdit = async () => {
    if (!editingCell) return;

    const { id, field } = editingCell;

    // Se não houve alteração, apenas cancelamos a edição
    const expense = expenses.find((e) => e.id === id);
    if (!expense || expense[field] === editValue) {
      cancelEdit();
      return;
    }

    try {
      const success = await mockApiCall(id, field, editValue);

      if (success) {
        // Atualiza localmente se a API retornou sucesso
        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) =>
            expense.id === id ? { ...expense, [field]: editValue } : expense
          )
        );
        showToast("Atualizado com sucesso!", "success");
      } else {
        showToast("Erro ao atualizar. Tente novamente.", "error");
      }
    } catch (error) {
      showToast("Erro ao conectar com o servidor.", "error");
    }

    // Limpa o estado de edição
    cancelEdit();
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
        cell: (info) => {
          const value = info.getValue();
          const rowId = info.row.original.id;
          const isEditing =
            editingCell?.id === rowId && editingCell?.field === "description";

          if (isEditing) {
            return (
              <div className="flex items-center">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 w-full"
                />
                <button
                  onClick={saveEdit}
                  className="ml-2 text-green-400 hover:text-green-300"
                  title="Salvar"
                >
                  <FiCheck />
                </button>
                <button
                  onClick={cancelEdit}
                  className="ml-1 text-red-400 hover:text-red-300"
                  title="Cancelar"
                >
                  <FiX />
                </button>
              </div>
            );
          }

          return (
            <div
              className="cursor-pointer hover:text-purple-300"
              onClick={() => startEdit(rowId, "description", value)}
              title="Clique para editar"
            >
              {value}
            </div>
          );
        },
      }),
      columnHelper.accessor("category", {
        header: "Categoria",
        cell: (info) => {
          const category = info.getValue();
          const rowId = info.row.original.id;
          const isEditing =
            editingCell?.id === rowId && editingCell?.field === "category";

          if (isEditing) {
            return (
              <div className="flex items-center">
                <select
                  ref={editInputRef as React.RefObject<HTMLSelectElement>}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
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
                <button
                  onClick={saveEdit}
                  className="ml-2 text-green-400 hover:text-green-300"
                  title="Salvar"
                >
                  <FiCheck />
                </button>
                <button
                  onClick={cancelEdit}
                  className="ml-1 text-red-400 hover:text-red-300"
                  title="Cancelar"
                >
                  <FiX />
                </button>
              </div>
            );
          }

          return (
            <div
              className="cursor-pointer"
              onClick={() => startEdit(rowId, "category", category)}
              title="Clique para editar"
            >
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  categoryColors[category] || "bg-gray-700 text-gray-300"
                }`}
              >
                {category}
              </span>
            </div>
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
    ],
    [editingCell, editValue]
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
                    <p>Clique na descrição ou categoria para editar</p>
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
