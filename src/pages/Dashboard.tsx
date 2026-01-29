import { useDashboardController } from "../hooks/controllers/useDashboardController";
import { SyncIndicator } from "../components/features/shared/SyncIndicator";
import { Beef, Layers, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { MobileHeader } from "../components/layout/MobileHeader";

export function Dashboard() {
  const { totalBovines, totalHerds, byGender, byHerd, growthRate, newBovinesCount } =
    useDashboardController();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans pb-24 transition-colors duration-300">
      <MobileHeader title="Visão Geral" />

      {/* HEADER DESKTOP */}
      <div className="hidden md:flex justify-between items-center max-w-5xl mx-auto pt-8 px-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
          Visão Geral
        </h1>
        <SyncIndicator />
      </div>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {/* KPIS (Cards de Topo) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 rounded-lg">
                <Beef size={20} />
              </div>
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Total de Cabeças
              </span>
            </div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-white">
              {totalBovines}
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg">
                <Layers size={20} />
              </div>
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Rebanhos Ativos
              </span>
            </div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-white">
              {totalHerds}
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-primary-400 to-primary-700 p-5 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <TrendingUp size={20} />
            <span className="text-sm font-medium">Novas Entradas</span>
          </div>
          <div className="text-3xl font-bold">+{newBovinesCount}</div>
          <div className="text-xs opacity-70 mt-1">
              {growthRate}% em relação ao total anterior (30d)
          </div>
        </div>
        </div>

        {/* GRÁFICOS */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Distribuição por Gênero */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-6">
              Por Gênero
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byGender}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {byGender.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      color: "#f3f4f6",
                    }}
                    itemStyle={{ color: "#f3f4f6" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {byGender.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por Rebanho */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-6">
              Maiores Rebanhos
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byHerd} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: "#888", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      color: "#f3f4f6",
                    }}
                    itemStyle={{ color: "#f3f4f6" }}
                  />
                  <Bar
                    dataKey="value"
                    name="Bovinos"
                    fill="rgb(var(--color-primary-500))"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
