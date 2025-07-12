import { formatMoney } from "@/utils/format-money";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PaymentMethodData {
  method: string;
  total: number;
  count: number;
  percentage: number;
}

interface PaymentMethodChartProps {
  data: PaymentMethodData[];
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="method" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatMoney(value),
            "Total",
          ]}
          contentStyle={{
            backgroundColor: "#F8F8F2",
            borderColor: "#374151",
            color: "#F8F8F2",
          }}
          labelStyle={{ color: "#374151" }}
        />
        <Legend />
        <Bar dataKey="total" name="Valor Gasto" radius={[5, 5, 0, 0]}>
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
