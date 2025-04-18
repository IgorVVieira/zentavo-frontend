// src/app/(auth)/dashboard/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import {
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiFilter,
} from "react-icons/fi";
import ToastNotifications, { showToast } from "@/components/ToastNotificatons";
import transactionService, {
  ExpenseItem,
  TransactionMethod,
} from "@/services/transactionService";
import PaymentMethodChart from "@/components/charts/PaymentMethodChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import ExpenseTrendChart from "@/components/charts/ExpenseTrendChart";
import Loading from "@/components/Loading";

export default function DashboardPage() {
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Mês atual (1-12)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!method) return "Desconhecido";

    const methodTranslations: Record<string, string> = {
      [TransactionMethod.PIX]: "Pix",
      [TransactionMethod.DEBIT]: "Débito",
      [TransactionMethod.TRANSFER]: "Transferência",
      [TransactionMethod.CARD_PAYMENT]: "Pagamento de Cartão",
    };

    return methodTranslations[method] || method;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Carregar transações
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      startLoading();
      try {
        const data = await transactionService.getMonthlyTransactions(
          currentMonth,
          currentYear
        );
        setTransactions(data);
      } catch (error: any) {
        console.error("Erro ao buscar transações:", error);
        showToast(error.message || "Erro ao carregar as transações", "error");
        setTransactions([]);
      } finally {
        setIsLoading(false);
        stopLoading();
      }
    };

    fetchTransactions();
  }, [currentMonth, currentYear, startLoading, stopLoading]);

  // Gerar dados para o gráfico de tendência (agrupando despesas por dia no mês atual)
  const dailyExpenseTrend = useMemo(() => {
    // Filtramos apenas as despesas (valores negativos) do mês atual
    const expensesOnly = transactions.filter(
      (expense) => expense.amount < 0 && expense.description !== "Aplicação RDB"
    );

    // Agrupamos por dia
    const expensesByDay: Record<string, number> = {};

    expensesOnly.forEach((expense) => {
      const date = expense.date.substring(0, 10); // Formato YYYY-MM-DD
      if (!expensesByDay[date]) {
        expensesByDay[date] = 0;
      }
      expensesByDay[date] += Math.abs(expense.amount);
    });

    // Convertemos para o formato esperado pelo gráfico
    return Object.entries(expensesByDay)
      .map(([date, value]) => {
        // Formatar a data para exibição mais amigável (DD/MM)
        const formattedDate = new Date(date)
          .toLocaleDateString("pt-BR")
          .substring(0, 5);
        return {
          date: formattedDate,
          value: value,
        };
      })
      .sort((a, b) => {
        // Ordenar por data
        const dateA = a.date.split("/").reverse().join("");
        const dateB = b.date.split("/").reverse().join("");
        return dateA.localeCompare(dateB);
      });
  }, [transactions]);

  // Calcular totais para resumo
  const totalIncome = transactions
    .filter((expense) => expense.amount > 0)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpenses = transactions
    .filter(
      (expense) => expense.amount < 0 && expense.description !== "Aplicação RDB"
    )
    .reduce((sum, expense) => sum + expense.amount, 0);

  const balance = totalIncome + totalExpenses;

  // Gerar dados de análise por método de pagamento
  const paymentMethodAnalysis = useMemo(() => {
    // Filtramos apenas as despesas (valores negativos)
    const expensesOnly = transactions.filter(
      (expense) => expense.amount < 0 && expense.description !== "Aplicação RDB"
    );

    // Calculamos o valor total negativo (em módulo)
    const totalExpenseAmount = Math.abs(
      expensesOnly.reduce((sum, expense) => sum + expense.amount, 0)
    );

    // Agrupamos por método de pagamento
    const methodGroups: Record<string, { total: number; count: number }> = {};

    expensesOnly.forEach((expense) => {
      const method = expense.method || "Desconhecido";
      if (!methodGroups[method]) {
        methodGroups[method] = { total: 0, count: 0 };
      }
      methodGroups[method].total += Math.abs(expense.amount);
      methodGroups[method].count += 1;
    });

    // Convertemos para o formato de saída
    return Object.entries(methodGroups)
      .map(([method, data]) => ({
        method: translateMethod(method),
        total: data.total,
        count: data.count,
        percentage:
          totalExpenseAmount > 0 ? (data.total / totalExpenseAmount) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  // Gerar dados de análise por categoria
  const categoryAnalysis = useMemo(() => {
    // Filtramos apenas as despesas (valores negativos)
    const expensesOnly = transactions.filter(
      (expense) => expense.amount < 0 && expense.description !== "Aplicação RDB"
    );

    // Calculamos o valor total negativo (em módulo)
    const totalExpenseAmount = Math.abs(
      expensesOnly.reduce((sum, expense) => sum + expense.amount, 0)
    );

    // Agrupamos por categoria
    const categoryGroups: Record<
      string,
      {
        total: number;
        count: number;
        name: string;
        color: string;
      }
    > = {};

    expensesOnly.forEach((expense) => {
      const categoryId = expense.category?.id || "others";
      const categoryName = expense.category?.name || "Outros";
      const categoryColor = expense.category?.color || "#6B7280";

      if (!categoryGroups[categoryId]) {
        categoryGroups[categoryId] = {
          total: 0,
          count: 0,
          name: categoryName,
          color: categoryColor,
        };
      }
      categoryGroups[categoryId].total += Math.abs(expense.amount);
      categoryGroups[categoryId].count += 1;
    });

    // Convertemos para o formato de saída
    return Object.entries(categoryGroups)
      .map(([id, data]) => ({
        id,
        name: data.name,
        color: data.color,
        total: data.total,
        count: data.count,
        percentage:
          totalExpenseAmount > 0 ? (data.total / totalExpenseAmount) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentMonth(newMonth);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentYear(newYear);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ToastNotifications />

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold flex items-center">
            <FiPieChart className="text-purple-400 mr-2" /> Dashboard Financeiro
          </h1>

          <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
            <FiFilter className="text-gray-400" />
            <select
              value={currentMonth}
              onChange={handleMonthChange}
              className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm"
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
              className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <Loading text="Carregando dados financeiros..." />
        ) : (
          <>
            {/* Gráfico de tendência de despesas */}
            {dailyExpenseTrend.length > 1 && (
              <div className="mb-6">
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  <div className="px-4 py-3 bg-gray-700 border-b border-gray-600 flex items-center">
                    <FiTrendingUp className="text-purple-400 mr-2" />
                    <h3 className="font-medium">
                      Evolução de Despesas - {months[currentMonth - 1]}/
                      {currentYear}
                    </h3>
                  </div>
                  <div className="p-4">
                    <ExpenseTrendChart data={dailyExpenseTrend} />
                  </div>
                </div>
              </div>
            )}

            {/* Gráficos de análise por método e categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Análise por método de pagamento */}
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-gray-700 border-b border-gray-600 flex items-center">
                  <FiBarChart2 className="text-purple-400 mr-2" />
                  <h3 className="font-medium">
                    Gastos por Método de Pagamento
                  </h3>
                </div>
                <div className="p-4">
                  {paymentMethodAnalysis.length > 0 ? (
                    <PaymentMethodChart data={paymentMethodAnalysis} />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                      Sem dados para o período selecionado
                    </div>
                  )}
                </div>
              </div>

              {/* Análise por categoria */}
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-gray-700 border-b border-gray-600 flex items-center">
                  <FiPieChart className="text-purple-400 mr-2" />
                  <h3 className="font-medium">Gastos por Categoria</h3>
                </div>
                <div className="p-4">
                  {categoryAnalysis.length > 0 ? (
                    <CategoryPieChart data={categoryAnalysis} />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                      Sem dados para o período selecionado
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabelas de detalhes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tabela de métodos de pagamento */}
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-gray-700 border-b border-gray-600">
                  <h3 className="font-medium">
                    Detalhes por Método de Pagamento
                  </h3>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="pb-2">Método</th>
                        <th className="pb-2 text-right">Valor</th>
                        <th className="pb-2 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentMethodAnalysis.length > 0 ? (
                        paymentMethodAnalysis.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-700 last:border-b-0"
                          >
                            <td className="py-2">{item.method}</td>
                            <td className="py-2 text-right">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="py-2 text-right">
                              {item.percentage.toFixed(1)}%
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-4 text-center text-gray-400"
                          >
                            Sem dados para o período selecionado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabela de categorias */}
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-gray-700 border-b border-gray-600">
                  <h3 className="font-medium">Detalhes por Categoria</h3>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="pb-2">Categoria</th>
                        <th className="pb-2 text-right">Valor</th>
                        <th className="pb-2 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryAnalysis.length > 0 ? (
                        categoryAnalysis.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-700 last:border-b-0"
                          >
                            <td className="py-2">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                {item.name}
                              </div>
                            </td>
                            <td className="py-2 text-right">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="py-2 text-right">
                              {item.percentage.toFixed(1)}%
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-4 text-center text-gray-400"
                          >
                            Sem dados para o período selecionado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
