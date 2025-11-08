// src/components/charts/ExpenseTrendChart.tsx
import React from "react";
import ReactECharts from "echarts-for-react";

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

  const option = {
    grid: {
      top: 5,
      right: 30,
      left: 20,
      bottom: 5,
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.date),
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
        formatter: (value: number) => `R$ ${value.toFixed(2)}`,
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
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>Valor: R$ ${param.value.toFixed(2)}`;
      },
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      textStyle: {
        color: "#fff",
      },
    },
    legend: {
      data: ["Despesa diária"],
      textStyle: {
        color: "#fff",
      },
    },
    series: [
      {
        name: "Despesa diária",
        type: "line",
        smooth: true,
        data: data.map((item) => item.value),
        itemStyle: {
          color: "#ff8042",
        },
        lineStyle: {
          color: "#ff8042",
          width: 2,
        },
        symbol: "circle",
        symbolSize: 8,
        markLine: {
          data: [
            {
              yAxis: average,
              label: {
                formatter: `Média: R$ ${average.toFixed(2)}`,
                position: "insideEndBottom",
              },
            },
          ],
          lineStyle: {
            color: "#8884d8",
            type: "dashed",
          },
          label: {
            color: "#8884d8",
            fontSize: 12,
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} />;
};

export default ExpenseTrendChart;
