import { Baby, Trash2 } from "lucide-react";
import type { BirthRecord, Bovine } from "../../../db/db";

interface BirthListProps {
  records: BirthRecord[];
  allBovines: Bovine[];
  onDelete: (id: number) => void;
  onCalfClick?: (calfId: number) => void;
}

export function BirthList({ records, allBovines, onDelete, onCalfClick }: BirthListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400 dark:text-neutral-500 text-sm">
        Nenhum registro de nascimento.
      </div>
    );
  }

  const getCalfName = (calfId?: number) => {
    if (!calfId) return null;
    return allBovines.find((b) => b.id === calfId)?.name || `#${calfId}`;
  };

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const calfName = getCalfName(record.calfId);
        return (
          <div
            key={record.id}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 p-4 flex items-start gap-3"
          >
            <div className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg shrink-0">
              <Baby size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-neutral-800 dark:text-white">
                {new Date(record.birthDate).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              {calfName && (
                <button
                  onClick={() => record.calfId && onCalfClick?.(record.calfId)}
                  className="text-xs text-secondary-600 dark:text-secondary-400 hover:underline mt-0.5"
                >
                  Cria: {calfName}
                </button>
              )}
              {!calfName && (
                <span className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 block">
                  Cria não vinculada
                </span>
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
        );
      })}
    </div>
  );
}
