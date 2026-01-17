import { useState } from "react";
import { Pencil, Trash2, ChevronRight } from "lucide-react";

interface DataCardProps {
  title: string;
  subtitle?: React.ReactNode;
  avatarChar: string;
  avatarColorClass?: string;
  status?: "synced" | "created" | "updated" | "deleted" | string;
  onEdit: () => void;
  onDelete: () => void;
}

export function DataCard({
  title,
  subtitle,
  avatarChar,
  avatarColorClass = "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  status,
  onEdit,
  onDelete,
}: DataCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Verifica se está pendente
  const isPending = status && status !== "synced";

  return (
    <div className="relative">
      {/* CARD PRINCIPAL */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
    group relative bg-white dark:bg-gray-800 p-4 rounded-xl border transition-all duration-200 cursor-pointer
    
    /* Estados de Interação */
    hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-0.5
    active:scale-[0.98] active:shadow-sm active:translate-y-0

    /* Estado Expandido */
    ${
      isExpanded
        ? "border-blue-500 ring-1 ring-blue-500 shadow-md dark:border-blue-400 dark:ring-blue-400"
        : "border-gray-100 dark:border-gray-700 shadow-sm"
    }
  `}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* AVATAR */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${avatarColorClass}`}
            >
              {avatarChar.toUpperCase()}
            </div>

            {/* INFO */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight flex items-center gap-2">
                {title}
                {isPending && (
                  <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">
                    Pendente
                  </span>
                )}
              </h3>
              {subtitle && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* SETA */}
          <div
            className={`
             p-1 rounded-full transition-colors duration-200
             ${
               isExpanded
                 ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                 : "text-gray-300 dark:text-gray-600 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 group-hover:text-gray-500"
             }
          `}
          >
            <ChevronRight
              size={20}
              className={`
                transition-transform duration-300
                ${isExpanded ? "rotate-90" : "group-hover:translate-x-0.5"}
              `}
            />
          </div>
        </div>
      </div>

      {/* MENU DE AÇÕES (EXPANDIDO) */}
      {isExpanded && (
        <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setIsExpanded(false);
            }}
            className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 py-3 rounded-lg font-medium flex items-center justify-center gap-2 active:bg-blue-100 dark:active:bg-blue-900/40 transition-colors"
          >
            <Pencil size={18} /> Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setIsExpanded(false);
            }}
            className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 py-3 rounded-lg font-medium flex items-center justify-center gap-2 active:bg-red-100 dark:active:bg-red-900/40 transition-colors"
          >
            <Trash2 size={18} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}
