"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface IExpenseChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const ExpenseChart = ({ data }: IExpenseChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          isAnimationActive={true}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Valor"]}
          labelFormatter={(name) => `Categoria: ${name}`}
          contentStyle={{
            backgroundColor: "#333",
            borderColor: "#888",
            color: "#fff",
          }}
          itemStyle={{
            color: "#00ff00",
          }}
          labelStyle={{
            color: "#ff9900",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;
