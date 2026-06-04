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
import {
  type WeightUnit,
  convertWeight,
  formatWeight,
  unitLabel,
} from "../../../lib/weightUtils";

interface WeightChartProps {
  records: WeightRecord[];
  unit?: WeightUnit;
  onUnitChange?: (unit: WeightUnit) => void;
}

export function WeightChart({ records, unit = "kg", onUnitChange }: WeightChartProps) {
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
    weight: convertWeight(r.weight, unit),
    fullDate: new Date(r.recordedAt).toLocaleDateString("pt-BR"),
  }));

  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  const currentWeight = convertWeight(records[records.length - 1].weight, unit);
  const diff =
    records.length >= 2
      ? convertWeight(records[records.length - 1].weight, unit) -
        convertWeight(records[0].weight, unit)
      : 0;

  const uLabel = unitLabel(unit);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-white">
              {formatWeight(currentWeight, unit)}
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
              {diff.toFixed(unit === "arroba" ? 2 : 1)} {uLabel}
            </div>
          )}
        </div>

        {/* Unit toggle */}
        {onUnitChange && (
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg p-0.5">
            <button
              onClick={() => onUnitChange("kg")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                unit === "kg"
                  ? "bg-white dark:bg-neutral-600 text-neutral-800 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              Kg
            </button>
            <button
              onClick={() => onUnitChange("arroba")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                unit === "arroba"
                  ? "bg-white dark:bg-neutral-600 text-neutral-800 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              @
            </button>
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
              formatter={(value) => [`${value} ${uLabel}`, "Peso"]}
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
