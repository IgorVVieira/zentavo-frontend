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
  FiCalendar,
} from "react-icons/fi";
import Link from "next/link";
import ToastNotifications, { showToast } from "@/components/ToastNotificatons";
import transactionService, {
  ExpenseItem,
  TransactionMethod,
} from "@/services/transactionService";
import PaymentMethodChart from "@/components/charts/PaymentMethodChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import ExpenseTrendChart from "@/components/charts/ExpenseTrendChart";
import MonthlyComparisonChart from "@/components/charts/MonthlyComparisonChart";
import Loading from "@/components/Loading";

export default function DashboardPage() {
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Mês atual (1-12)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState<any[]>([]);

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

  // Função para obter dados de comparação mensal
  const getMonthlyComparisonData = async () => {
    const today = new Date();
    const fetchPromises = [];
    const monthsToFetch: { month: number; year: number }[] = [];

    // Prepara as chamadas para os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      monthsToFetch.push({ month, year });
      fetchPromises.push(
        transactionService.getMonthlyTransactions(month, year)
      );
    }

    try {
      // Executa todas as chamadas em paralelo
      const results = await Promise.allSettled(fetchPromises);

      return results.map((result, index) => {
        const { month, year } = monthsToFetch[index];
        const monthName = months[month - 1].substring(0, 3);

        if (result.status === "fulfilled") {
          const data = result.value;

          const income = data
            .filter((item) => item.amount > 0)
            .reduce((sum, item) => sum + item.amount, 0);

          const expenses = Math.abs(
            data
              .filter(
                (item) =>
                  item.amount < 0 && item.description !== "Aplicação RDB"
              )
              .reduce((sum, item) => sum + item.amount, 0)
          );

          return {
            month: `${monthName}/${year.toString().slice(-2)}`,
            income: income,
            expenses: expenses,
          };
        } else {
          // Em caso de erro, retorna dados vazios
          console.error(
            `Erro ao obter dados de ${month}/${year}:`,
            result.reason
          );
          return {
            month: `${monthName}/${year.toString().slice(-2)}`,
            income: 0,
            expenses: 0,
          };
        }
      });
    } catch (error) {
      console.error("Erro ao obter comparação mensal:", error);
      return [];
    }
  };

  // Carregar transações e dados de comparação
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      startLoading();

      try {
        // Carrega as transações do mês atual
        const data = await transactionService.getMonthlyTransactions(
          currentMonth,
          currentYear
        );
        setTransactions(data);

        // Carrega dados históricos para comparação mensal
        const comparisonData = await getMonthlyComparisonData();
        setMonthlyComparisonData(comparisonData);
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        showToast(error.message || "Erro ao carregar dados", "error");
      } finally {
        setIsLoading(false);
        stopLoading();
      }
    };

    loadData();
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
            <FiCalendar className="text-gray-400" />
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
            {/* Gráfico de Comparação Mensal */}
            <div className="mb-6">
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-gray-700 border-b border-gray-600 flex items-center">
                  <FiBarChart2 className="text-purple-400 mr-2" />
                  <h3 className="font-medium">
                    Comparativo Mensal - Últimos 6 Meses
                  </h3>
                </div>
                <div className="p-4">
                  {monthlyComparisonData.length > 0 ? (
                    <MonthlyComparisonChart data={monthlyComparisonData} />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                      Carregando dados históricos...
                    </div>
                  )}
                </div>
              </div>
            </div>

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
          </>
        )}
      </main>
    </div>
  );
}
