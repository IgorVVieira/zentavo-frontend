"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface BalanceChartProps {
  data: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
}

const BalanceChart = ({ data }: BalanceChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="month" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip
          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, ""]}
          contentStyle={{ backgroundColor: "#2D3748", borderColor: "#4A5568" }}
        />
        <Legend />
        <ReferenceLine y={0} stroke="#888" />
        <Bar dataKey="income" name="Receitas" fill="#10B981" /> {/* Green */}
        <Bar dataKey="expenses" name="Despesas" fill="#EF4444" /> {/* Red */}
        <Bar dataKey="balance" name="Saldo" fill="#8B5CF6" /> {/* Purple */}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BalanceChart;
