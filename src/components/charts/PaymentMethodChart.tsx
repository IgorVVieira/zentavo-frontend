import { formatMoney } from "@/utils/format-money";
import React from "react";
import ReactECharts from "echarts-for-react";

interface IPaymentMethodData {
  method: string;
  total: number;
  count: number;
  percentage: number;
}

interface IPaymentMethodChartProps {
  data: IPaymentMethodData[];
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

const PaymentMethodChart: React.FC<IPaymentMethodChartProps> = ({ data }) => {
  const option = {
    grid: {
      top: 20,
      right: 15,
      left: 15,
      bottom: 60,
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.method),
      axisLabel: {
        color: "#ccc",
        fontSize: 12,
        rotate: -45,
        interval: 0,
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
        fontSize: 12,
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
      backgroundColor: "#fff",
      borderColor: "#374151",
      textStyle: {
        color: "#374151",
        fontSize: 12,
      },
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>${formatMoney(param.value)}`;
      },
    },
    series: [
      {
        name: "Valor Gasto",
        type: "bar",
        data: data.map((item, index) => ({
          value: item.total,
          itemStyle: {
            color: COLORS[index % COLORS.length],
            opacity: 0.9,
          },
        })),
        barWidth: "60%",
        label: {
          show: false,
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} />;
};

export default PaymentMethodChart;
