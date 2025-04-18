// src/components/charts/ExpenseTrendChart.tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface TrendData {
  date: string;
  value: number;
}

interface ExpenseTrendChartProps {
  data: TrendData[];
}

const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({ data }) => {
  // Calcular a média para a linha de referência
  const average =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.value, 0) / data.length
      : 0;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="date" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <Tooltip
          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Valor"]}
          contentStyle={{
            backgroundColor: "#1f2937",
            borderColor: "#374151",
            color: "#fff",
          }}
          labelStyle={{ color: "#fff" }}
        />
        <Legend />
        <ReferenceLine
          y={average}
          stroke="#8884d8"
          strokeDasharray="3 3"
          label={{
            value: `Média: R$ ${average.toFixed(2)}`,
            position: "insideBottomRight",
            fill: "#8884d8",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          name="Despesa diária"
          stroke="#ff8042"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ExpenseTrendChart;
