import { formatMoney } from "@/utils/format-money";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

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
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 15,
          left: 15,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis
          dataKey="method"
          stroke="#ccc"
          fontSize={12}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="#ccc" fontSize={12} width={60} />
        <Tooltip
          formatter={(value: number) => [formatMoney(value), "Total"]}
          contentStyle={{
            backgroundColor: "#fff",
            borderColor: "#374151",
            color: "#374151",
            fontSize: "12px",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#374151" }}
        />
        <Bar dataKey="total" name="Valor Gasto" radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              opacity={0.9}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PaymentMethodChart;
