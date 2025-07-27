"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import {
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
} from "react-icons/fi";
import ToastNotifications, { showToast } from "@/components/ToastNotificatons";
import transactionService, {
  TransactionMethod,
  TransactionType,
  ITransactionsByMethodDto,
  ITransactionsByCategoryDto,
  ILastSixMonthsData,
} from "@/services/transactionService";
import PaymentMethodChart from "@/components/charts/PaymentMethodChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import MonthlyComparisonChart from "@/components/charts/MonthlyComparisonChart";
import Loading from "@/components/Loading";

export default function DashboardPage() {
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [methodsData, setMethodsData] = useState<ITransactionsByMethodDto[]>(
    []
  );
  const [expenseCategoriesData, setExpenseCategoriesData] = useState<
    ITransactionsByCategoryDto[]
  >([]);
  const [incomeCategoriesData, setIncomeCategoriesData] = useState<
    ITransactionsByCategoryDto[]
  >([]);
  const [sixMonthsData, setSixMonthsData] = useState<ILastSixMonthsData[]>([]);

  const [isMethodsLoading, setIsMethodsLoading] = useState(true);
  const [isExpenseCategoryLoading, setIsExpenseCategoryLoading] =
    useState(true);
  const [isIncomeCategoryLoading, setIsIncomeCategoryLoading] = useState(true);
  const [isSixMonthsLoading, setIsSixMonthsLoading] = useState(true);

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

  useEffect(() => {
    const loadMethodsData = async () => {
      setIsMethodsLoading(true);
      startLoading();

      try {
        const data = await transactionService.getTransactionsByMethod(
          currentMonth,
          currentYear
        );

        setMethodsData(data);
      } catch (error: any) {
        showToast(
          "Ocorreu um erro ao carregar dados de métodos de pagamento.",
          "warning"
        );
      } finally {
        setIsMethodsLoading(false);
        stopLoading();
      }
    };

    loadMethodsData();
  }, [currentMonth, currentYear]); // REMOVIDO startLoading, stopLoading e user

  // Efeito separado para carregar dados de categorias de gastos
  useEffect(() => {
    const loadExpenseCategoryData = async () => {
      setIsExpenseCategoryLoading(true);

      try {
        const data = await transactionService.getTransactionsByCategory(
          currentMonth,
          currentYear,
          TransactionType.CASH_OUT
        );

        setExpenseCategoriesData(data);
      } catch (error: any) {
        showToast(
          "Ocorreu um erro ao carregar dados de categorias de gastos.",
          "warning"
        );
      } finally {
        setIsExpenseCategoryLoading(false);
      }
    };

    loadExpenseCategoryData();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const loadIncomeCategoryData = async () => {
      setIsIncomeCategoryLoading(true);

      try {
        const data = await transactionService.getTransactionsByCategory(
          currentMonth,
          currentYear,
          TransactionType.CASH_IN
        );

        setIncomeCategoriesData(data);
      } catch (error: any) {
        showToast(
          "Ocorreu um erro ao carregar dados de categorias de receita.",
          "warning"
        );
      } finally {
        setIsIncomeCategoryLoading(false);
      }
    };

    loadIncomeCategoryData();
  }, [currentMonth, currentYear]);

  // Efeito para carregar dados dos últimos 6 meses
  useEffect(() => {
    const loadSixMonthsData = async () => {
      setIsSixMonthsLoading(true);

      try {
        const data = await transactionService.getLastSixMonthsData();
        setSixMonthsData(data);
      } catch (error: any) {
        showToast(
          "Ocorreu um erro ao carregar dados dos últimos 6 meses.",
          "warning"
        );
      } finally {
        setIsSixMonthsLoading(false);
      }
    };

    loadSixMonthsData();
  }, []); // Executa apenas uma vez ao montar o componente

  const paymentMethodChartData = useMemo(() => {
    if (!methodsData || methodsData.length === 0) return [];

    const chartData = methodsData.map((item) => ({
      method: translateMethod(item.method),
      total: Math.abs(item.total),
      count: methodsData.length,
      percentage: 0, // Calcularemos isso a seguir
    }));

    const totalAmount = chartData.reduce((sum, item) => sum + item.total, 0);

    chartData.forEach((item) => {
      item.percentage = totalAmount > 0 ? (item.total / totalAmount) * 100 : 0;
    });

    return chartData;
  }, [methodsData]);

  const monthlyComparisonData = useMemo(() => {
    if (!sixMonthsData || sixMonthsData.length === 0) return [];

    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    return sixMonthsData.map((item) => ({
      month: `${monthNames[item.month - 1]}/${item.year}`,
      income: item.totalCashIn,
      expenses: Math.abs(item.totalCashOut), // Converter para positivo para melhor visualização
    }));
  }, [sixMonthsData]);

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

        {isMethodsLoading ? (
          <Loading text="Carregando dados financeiros..." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-gray-700 border-b border-gray-600 flex items-center">
                  <FiBarChart2 className="text-purple-400 mr-2" />
                  <h3 className="font-medium">
                    Gastos por Método de Pagamento
                  </h3>
                </div>
                <div className="p-4">
                  {paymentMethodChartData?.length ? (
                    <PaymentMethodChart data={paymentMethodChartData} />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                      Sem dados para o período selecionado
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-gray-700 border-b border-gray-600 flex items-center">
                  <FiPieChart className="text-purple-400 mr-2" />
                  <h3 className="font-medium">Gastos por Categoria</h3>
                </div>
                <div className="p-4">
                  <CategoryPieChart
                    data={expenseCategoriesData}
                    loading={isExpenseCategoryLoading}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-gray-700 border-b border-gray-600 flex items-center">
                  <FiPieChart className="text-purple-400 mr-2" />
                  <h3 className="font-medium">Receita por Categoria</h3>
                </div>
                <div className="p-4">
                  <CategoryPieChart
                    data={incomeCategoriesData}
                    loading={isIncomeCategoryLoading}
                  />
                </div>
              </div>
            </div>

            {/* Placeholders para gráficos que serão implementados em chamadas separadas */}
            <div className="mb-6">
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-gray-700 border-b border-gray-600 flex items-center">
                  <FiBarChart2 className="text-purple-400 mr-2" />
                  <h3 className="font-medium">
                    Comparativo Mensal - Últimos 6 Meses (Em desenvolvimento)
                  </h3>
                </div>
                <div className="p-4">
                  <MonthlyComparisonChart
                    data={monthlyComparisonData}
                    loading={isSixMonthsLoading}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-gray-700 border-b border-gray-600 flex items-center">
                  <FiTrendingUp className="text-purple-400 mr-2" />
                  <h3 className="font-medium">
                    Evolução de Despesas - {months[currentMonth - 1]}/
                    {currentYear} (Em desenvolvimento)
                  </h3>
                </div>
                <div className="p-4">
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <p>Dados serão implementados em uma chamada separada</p>
                    <button
                      className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors"
                      onClick={() =>
                        showToast("Função será implementada em breve", "info")
                      }
                    >
                      Carregar dados
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
