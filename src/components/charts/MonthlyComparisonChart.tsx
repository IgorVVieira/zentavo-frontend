import { formatMoney } from "@/utils/format-money";
import React from "react";
import ReactECharts from "echarts-for-react";

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

  const option = {
    grid: {
      top: 20,
      right: 30,
      left: 20,
      bottom: 5,
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.month),
      axisLabel: {
        color: "#ccc",
      },
      axisLine: {
        lineStyle: {
          color: "#444",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#ccc",
        formatter: (value: number) => formatMoney(value),
      },
      axisLine: {
        lineStyle: {
          color: "#444",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#444",
          type: "dashed",
        },
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      textStyle: {
        color: "#fff",
      },
      borderRadius: 8,
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`;
        params.forEach((param: any) => {
          result += `${param.marker}${param.seriesName}: ${formatMoney(param.value)}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ["Receitas", "Despesas"],
      textStyle: {
        color: "#fff",
      },
    },
    series: [
      {
        name: "Receitas",
        type: "bar",
        data: data.map((item) => item.income),
        itemStyle: {
          color: "#10B981",
        },
      },
      {
        name: "Despesas",
        type: "bar",
        data: data.map((item) => item.expenses),
        itemStyle: {
          color: "#EF4444",
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} />;
};

export default MonthlyComparisonChart;
