import { formatMoney } from "@/utils/format-money";
import React from "react";
import ReactECharts from "echarts-for-react";

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

  const option = {
    tooltip: {
      trigger: "item",
      formatter: function (params: any) {
        if (!params) return "";
        const name = params.name || "";
        const value = params.value || 0;
        return `${name}<br/>Valor: ${formatMoney(value)}`;
      },
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      borderWidth: 1,
      textStyle: {
        color: "#fff",
        fontSize: 12,
      },
      borderRadius: 8,
      padding: [8, 12],
      confine: true,
      extraCssText: "box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);",
    },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center",
      textStyle: {
        color: "#fff",
      },
      data: processedData.map((item) => item.name),
      formatter: (name: string) => {
        const item = processedData.find((d) => d.name === name);
        return item ? name : "";
      },
    },
    series: [
      {
        name: "Categorias",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["40%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 0,
          borderColor: "#1f2937",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: (params: any) => {
            if (params.percent < 5) return "";
            return `${params.percent.toFixed(0)}%`;
          },
          color: "#fff",
          fontSize: 12,
          fontWeight: "bold",
        },
        labelLine: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data: processedData.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color,
          },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} />;
};

export default CategoryPieChart;
