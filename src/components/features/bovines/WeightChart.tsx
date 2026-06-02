import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { WeightRecord } from "../../../db/db";

interface WeightChartProps {
  records: WeightRecord[];
}

export function WeightChart({ records }: WeightChartProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400 dark:text-neutral-500 text-sm">
        Nenhum registro de peso ainda.
      </div>
    );
  }

  const data = records.map((r) => ({
    date: new Date(r.recordedAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
    weight: r.weight,
    fullDate: new Date(r.recordedAt).toLocaleDateString("pt-BR"),
  }));

  const minWeight = Math.min(...records.map((r) => r.weight));
  const maxWeight = Math.max(...records.map((r) => r.weight));
  const diff = records.length >= 2 ? records[records.length - 1].weight - records[0].weight : 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-neutral-800 dark:text-white">
            {records[records.length - 1].weight} kg
          </span>{" "}
          atual
        </div>
        {records.length >= 2 && (
          <div
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              diff >= 0
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : "bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400"
            }`}
          >
            {diff >= 0 ? "+" : ""}
            {diff.toFixed(1)} kg
          </div>
        )}
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(128,128,128,0.15)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#888", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[Math.floor(minWeight * 0.9), Math.ceil(maxWeight * 1.1)]}
              tick={{ fill: "#888", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "12px",
                color: "#f3f4f6",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value} kg`, "Peso"]}
              labelFormatter={(label) => label}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="rgb(var(--color-secondary-500))"
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: "rgb(var(--color-secondary-500))",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
