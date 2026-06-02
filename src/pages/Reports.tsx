import { useState } from "react";
import { FileText, Download, FileSpreadsheet, Filter } from "lucide-react";
import { MobileHeader } from "../components/layout/MobileHeader";
import { SyncIndicator } from "../components/features/shared/SyncIndicator";
import { Select } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import {
  useReportsController,
  type ReportFilters,
  type ReportType,
} from "../hooks/controllers/useReportsController";
import { exportToCsv, exportToPdf } from "../lib/exportUtils";

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "inventory", label: "Inventário Geral" },
  { value: "weight_history", label: "Histórico de Peso" },
  { value: "births", label: "Nascimentos" },
  { value: "health", label: "Saúde / Vacinação" },
  { value: "mortality", label: "Mortalidade" },
];

export function Reports() {
  const [filters, setFilters] = useState<ReportFilters>({
    type: "inventory",
    dateFrom: "",
    dateTo: "",
    herdId: "",
  });

  const { data, columns, herds, totalRows } = useReportsController(filters);

  const reportLabel =
    REPORT_TYPES.find((r) => r.value === filters.type)?.label || "Relatório";

  const herdLabel = filters.herdId
    ? herds.find((h) => h.id === Number(filters.herdId))?.name || ""
    : "Todos os rebanhos";

  const filterDescription = [
    herdLabel,
    filters.dateFrom ? `De: ${new Date(filters.dateFrom).toLocaleDateString("pt-BR")}` : null,
    filters.dateTo ? `Até: ${new Date(filters.dateTo).toLocaleDateString("pt-BR")}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const handleExportCsv = () => {
    exportToCsv(data, columns, `gadoapp_${filters.type}_${Date.now()}`);
  };

  const handleExportPdf = () => {
    exportToPdf(
      data,
      columns,
      reportLabel,
      `gadoapp_${filters.type}_${Date.now()}`,
      filterDescription,
    );
  };

  const needsDateFilter = filters.type !== "inventory" && filters.type !== "mortality";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans pb-24 transition-colors duration-300">
      <MobileHeader title="Relatórios" />

      <div className="hidden md:flex justify-between items-center max-w-5xl mx-auto pt-8 px-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
          Relatórios
        </h1>
        <SyncIndicator />
      </div>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {/* FILTER BAR */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-primary-600" />
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
              Gerar Relatório
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value as ReportType })
                }
              >
                {REPORT_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Rebanho</Label>
              <Select
                value={filters.herdId}
                onChange={(e) =>
                  setFilters({ ...filters, herdId: e.target.value })
                }
              >
                <option value="">Todos</option>
                {herds.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </Select>
            </div>

            {needsDateFilter && (
              <>
                <div>
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* RESULTS HEADER + EXPORT */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
              {reportLabel}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {totalRows} registro{totalRows !== 1 ? "s" : ""} encontrado{totalRows !== 1 ? "s" : ""}
              {filterDescription ? ` • ${filterDescription}` : ""}
            </p>
          </div>

          {totalRows > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-green-200 dark:shadow-none transition-colors active:scale-[0.98]"
              >
                <FileSpreadsheet size={16} />
                Exportar CSV
              </button>
              <button
                onClick={handleExportPdf}
                className="flex items-center gap-2 px-4 py-2.5 bg-danger-600 hover:bg-danger-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-danger-200 dark:shadow-none transition-colors active:scale-[0.98]"
              >
                <Download size={16} />
                Exportar PDF
              </button>
            </div>
          )}
        </div>

        {/* DATA TABLE */}
        {totalRows > 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-700">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="text-left px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-300 whitespace-nowrap"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 100).map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-neutral-50 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="px-4 py-3 text-neutral-700 dark:text-neutral-300 whitespace-nowrap"
                        >
                          {row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.length > 100 && (
              <div className="px-4 py-3 text-center text-sm text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-700">
                Mostrando 100 de {data.length} registros. Exporte para ver todos.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-12 text-center">
            <FileText
              size={48}
              className="mx-auto mb-4 text-neutral-300 dark:text-neutral-600"
            />
            <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
              Nenhum registro encontrado
            </h3>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              Ajuste os filtros ou selecione outro tipo de relatório
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
