"use client";

import { formatMoney } from "@/utils/format-money";
import ReactECharts from "echarts-for-react";

interface IBalanceChartProps {
  data: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
}

const BalanceChart = ({ data }: IBalanceChartProps) => {
  const option = {
    grid: {
      top: 5,
      right: 30,
      left: 20,
      bottom: 5,
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.month),
      axisLabel: {
        color: "#888",
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
        color: "#888",
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
      backgroundColor: "#2D3748",
      borderColor: "#4A5568",
      textStyle: {
        color: "#fff",
      },
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`;
        params.forEach((param: any) => {
          result += `${param.marker}${param.seriesName}: ${formatMoney(param.value)}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ["Receitas", "Despesas", "Saldo"],
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
      {
        name: "Saldo",
        type: "bar",
        data: data.map((item) => item.balance),
        itemStyle: {
          color: "#8B5CF6",
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />;
};

export default BalanceChart;
