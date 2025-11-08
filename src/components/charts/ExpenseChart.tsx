"use client";

import ReactECharts from "echarts-for-react";

interface IExpenseChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const ExpenseChart = ({ data }: IExpenseChartProps) => {
  const option = {
    tooltip: {
      trigger: "item",
      formatter: function (params: any) {
        if (!params) return "";
        const name = params.name || "";
        const value = params.value || 0;
        return `Categoria: ${name}<br/>Valor: R$ ${value.toFixed(2)}`;
      },
      backgroundColor: "#333",
      borderColor: "#888",
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
      left: "left",
      textStyle: {
        color: "#fff",
      },
      data: data.map((item) => item.name),
      formatter: (name: string) => {
        return name;
      },
    },
    series: [
      {
        name: "Despesas",
        type: "pie",
        radius: "65%",
        center: ["50%", "50%"],
        data: data.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color,
          },
        })),
        label: {
          show: true,
          formatter: (params: any) => {
            return `${params.name}: ${params.percent.toFixed(0)}%`;
          },
          color: "#fff",
        },
        labelLine: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />;
};

export default ExpenseChart;
