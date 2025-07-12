"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ExpenseChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const ExpenseChart = ({ data }: ExpenseChartProps) => {
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
            backgroundColor: "#333", // Cor de fundo do tooltip
            borderColor: "#888", // Cor da borda
            color: "#fff", // Cor do texto
          }}
          itemStyle={{
            color: "#00ff00", // Cor do texto dos itens
          }}
          labelStyle={{
            color: "#ff9900", // Cor do label (categoria)
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;
