import { useDashboardController } from "../hooks/controllers/useDashboardController";
import { SyncIndicator } from "../components/features/shared/SyncIndicator";
import {
  Beef,
  Layers,
  TrendingUp,
  Baby,
  Skull,
  Syringe,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
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
  const {
    totalBovines,
    totalHerds,
    byGender,
    byStatus,
    herdDistribution,
    growthRate,
    newBovinesCount,
    birthRate,
    birthsLast12Months,
    totalFemales,
    mortalityRate,
    deadCount,
    avgWeightGain,
    vaccinationCoverage,
    overdueVaccinesCount,
    birthsByMonth,
  } = useDashboardController();

  const tooltipStyle = {
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "12px",
    color: "#f3f4f6",
    fontSize: "12px",
  };

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
        {/* ROW 1: Main KPIs */}
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

        {/* ROW 2: Analytics KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-lg">
                <Baby size={16} />
              </div>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Natalidade
              </span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">
              {birthRate}%
            </div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
              {birthsLast12Months} nasc / {totalFemales} fêmeas (12m)
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-danger-50 dark:bg-danger-900/20 text-danger-600 rounded-lg">
                <Skull size={16} />
              </div>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Mortalidade
              </span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">
              {mortalityRate}%
            </div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
              {deadCount} mortes no total
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                <TrendingUp size={16} />
              </div>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Ganho Médio
              </span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">
              {avgWeightGain ? `${avgWeightGain} kg` : "—"}
            </div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
              Entre primeira e última pesagem
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-lg">
                <Syringe size={16} />
              </div>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Cobertura Vacinal
              </span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">
              {vaccinationCoverage}%
            </div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
              Com ao menos 1 vacina
            </div>
          </div>
        </div>

        {/* Overdue vaccines warning */}
        {overdueVaccinesCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0" size={20} />
            <div>
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {overdueVaccinesCount} vacina{overdueVaccinesCount > 1 ? "s" : ""} atrasada{overdueVaccinesCount > 1 ? "s" : ""}
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400">
                Verifique os registros de saúde dos seus bovinos
              </div>
            </div>
          </div>
        )}

        {/* CHARTS */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* By Gender */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-6">
              Por Gênero
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byGender}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {byGender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#f3f4f6" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {byGender.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* By Status */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-6">
              Por Status
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {byStatus.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.fill} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#f3f4f6" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {byStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Births by month + Herd distribution */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Births by month */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={18} className="text-pink-600" />
              <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                Nascimentos por Mês
              </h3>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={birthsByMonth}>
                  <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Nascimentos" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Herd Distribution */}
          {herdDistribution.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-6">
                Distribuição por Rebanho
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={herdDistribution} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fill: "#888", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "transparent" }} itemStyle={{ color: "#f3f4f6" }} />
                    <Bar dataKey="value" name="Bovinos" fill="rgb(var(--color-primary-500))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
