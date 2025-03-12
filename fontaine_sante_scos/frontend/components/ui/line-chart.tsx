import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface LineChartProps<T> {
  data: T[];
  xField: keyof T;
  yField: keyof T;
  tooltipFormat?: (value: number) => string;
  className?: string;
}

export function LineChart<T>({
  data,
  xField,
  yField,
  tooltipFormat,
  className = "w-full h-full",
}: LineChartProps<T>) {
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      [xField]:
        item[xField] instanceof Date
          ? format(item[xField] as Date, "MMM d, yyyy")
          : item[xField],
    }));
  }, [data, xField]);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xField as string}
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={tooltipFormat}
          />
          <Tooltip
            formatter={(value: number) =>
              tooltipFormat ? tooltipFormat(value) : value
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={yField as string}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
