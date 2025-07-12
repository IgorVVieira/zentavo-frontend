// src/components/charts/MonthlyComparisonChart.tsx
import { formatMoney } from "@/utils/format-money";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface IMonthlyData {
  month: string;
  expenses: number;
  income: number;
}

interface IMonthlyComparisonChartProps {
  data: IMonthlyData[];
  loading?: boolean;
}

const MonthlyComparisonChart: React.FC<IMonthlyComparisonChartProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">Carregando dados mensais...</span>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="month" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <Tooltip
          formatter={(value: number) => [formatMoney(value), ""]}
          contentStyle={{
            backgroundColor: "#1f2937",
            borderColor: "#374151",
            color: "#fff",
          }}
        />
        <Legend />
        <Bar dataKey="income" name="Receitas" fill="#10B981" />
        <Bar dataKey="expenses" name="Despesas" fill="#EF4444" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyComparisonChart;
