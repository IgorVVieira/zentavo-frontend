import { formatMoney } from "@/utils/format-money";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ICategoryData {
  id: string;
  name: string;
  color?: string | null;
  total: number;
  percentage: number;
}

interface ICategoryPieChartProps {
  data: ICategoryData[];
  loading?: boolean;
}

const RADIAN = Math.PI / 180;
const DEFAULT_COLORS = [
  "#EF4444", // Vermelho
  "#F97316", // Laranja
  "#F59E0B", // Âmbar
  "#EAB308", // Amarelo
  "#84CC16", // Lima
  "#22C55E", // Verde
  "#10B981", // Esmeralda
  "#14B8A6", // Turquesa
  "#06B6D4", // Ciano
  "#0EA5E9", // Azul Claro
  "#3B82F6", // Azul
  "#6366F1", // Índigo
  "#8B5CF6", // Violeta
  "#A855F7", // Roxo
  "#D946EF", // Fúcsia
  "#EC4899", // Rosa
  "#F43F5E", // Rosa Escuro
  "#6B7280", // Cinza
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: any) => {
  if (percent < 0.05) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CategoryPieChart: React.FC<ICategoryPieChartProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">Carregando dados...</span>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Sem dados para o período selecionado
      </div>
    );
  }

  const orderedData = data.toReversed();
  const processedData = orderedData.map((item, index) => ({
    ...item,
    value: Math.abs(item.total),
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value" // Mudou de "total" para "value"
          nameKey="name"
          isAnimationActive={true}
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatMoney(value), "Valor"]}
          contentStyle={{
            backgroundColor: "#fff",
            borderColor: "#374151",
            color: "#fff",
          }}
          labelStyle={{ color: "#fff" }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          formatter={(value, entry: any, index) => (
            <span style={{ color: "#fff" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;
