import { useState } from "react";
import { Syringe, Pill, Trash2, AlertCircle } from "lucide-react";
import type { HealthRecord } from "../../../db/db";

interface HealthListProps {
  records: HealthRecord[];
  onDelete: (id: number) => void;
}

export function HealthList({ records, onDelete }: HealthListProps) {
  const [filter, setFilter] = useState<"ALL" | "VACCINE" | "MEDICATION">("ALL");

  const filtered =
    filter === "ALL" ? records : records.filter((r) => r.type === filter);

  const isOverdue = (nextDueDate?: string) => {
    if (!nextDueDate) return false;
    return new Date(nextDueDate) < new Date();
  };

  const isDueSoon = (nextDueDate?: string) => {
    if (!nextDueDate) return false;
    const due = new Date(nextDueDate);
    const now = new Date();
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 30;
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(
          [
            { key: "ALL", label: "Todos" },
            { key: "VACCINE", label: "Vacinas" },
            { key: "MEDICATION", label: "Medicamentos" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.key
                ? "bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400"
                : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-neutral-400 dark:text-neutral-500 text-sm">
          Nenhum registro de saúde.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 p-4 flex items-start gap-3"
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  record.type === "VACCINE"
                    ? "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"
                    : "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                }`}
              >
                {record.type === "VACCINE" ? (
                  <Syringe size={18} />
                ) : (
                  <Pill size={18} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-800 dark:text-white truncate">
                    {record.productName}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      record.type === "VACCINE"
                        ? "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
                        : "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    }`}
                  >
                    {record.type === "VACCINE" ? "Vacina" : "Medicamento"}
                  </span>
                </div>

                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Aplicado em{" "}
                  {new Date(record.appliedAt).toLocaleDateString("pt-BR")}
                  {record.dosage && ` • ${record.dosage}`}
                </div>

                {record.veterinarian && (
                  <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                    Vet: {record.veterinarian}
                  </div>
                )}

                {record.nextDueDate && (
                  <div
                    className={`flex items-center gap-1 text-xs mt-1 ${
                      isOverdue(record.nextDueDate)
                        ? "text-danger-600 dark:text-danger-400 font-medium"
                        : isDueSoon(record.nextDueDate)
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-neutral-400 dark:text-neutral-500"
                    }`}
                  >
                    {isOverdue(record.nextDueDate) && (
                      <AlertCircle size={12} />
                    )}
                    Próxima dose:{" "}
                    {new Date(record.nextDueDate).toLocaleDateString("pt-BR")}
                    {isOverdue(record.nextDueDate) && " (ATRASADA)"}
                  </div>
                )}

                {record.notes && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {record.notes}
                  </p>
                )}
              </div>

              <button
                onClick={() => record.id && onDelete(record.id)}
                className="p-2 text-neutral-400 hover:text-danger-500 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
