// src/components/charts/MonthlyComparisonChart.tsx
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

interface MonthlyData {
  month: string;
  expenses: number;
  income: number;
}

interface MonthlyComparisonChartProps {
  data: MonthlyData[];
}

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
  data,
}) => {
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
          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, ""]}
          contentStyle={{
            backgroundColor: "#1f2937",
            borderColor: "#374151",
            color: "#fff",
          }}
        />
        <Legend />
        <Bar dataKey="income" name="Receitas" fill="#10B981" stackId="a" />
        <Bar dataKey="expenses" name="Despesas" fill="#EF4444" stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyComparisonChart;
