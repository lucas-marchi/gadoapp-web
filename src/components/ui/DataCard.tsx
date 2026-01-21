import { useState } from "react";
import { Pencil, Trash2, ChevronRight, Check } from "lucide-react";
import { useLongPress } from "../../hooks/ui/useLongPress";

interface DataCardProps {
  title: string;
  subtitle?: React.ReactNode;
  avatarChar: string;
  avatarColorClass?: string;
  status?: "synced" | "created" | "updated" | "deleted" | string;
  onEdit: () => void;
  onDelete: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onLongPress?: () => void;
}

export function DataCard({
  title,
  subtitle,
  avatarChar,
  avatarColorClass = "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
  status,
  onEdit,
  onDelete,
  selectable,
  isSelected,
  onSelect,
  onLongPress,
}: DataCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isPending = status && status !== "synced";

  // Lógica unificada de clique (Curto vs Longo)
  const handleInteraction = () => {
    if (selectable && onSelect) {
      onSelect();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const longPressProps = useLongPress(
    () => {
      if (onLongPress) onLongPress();
    },
    handleInteraction,
    { delay: 600 },
  );

  return (
    <div
      className={`relative transition-colors duration-200 ${
        isSelected ? "bg-primary-50/50 dark:bg-primary-900/10 rounded-xl" : ""
      }`}
    >
      {/* CARD PRINCIPAL */}
      <div
        {...longPressProps}
        className={`
          group relative bg-white dark:bg-neutral-800 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none
          
          hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-0.5
          active:scale-[0.98] active:shadow-sm active:translate-y-0

          ${
            isExpanded
              ? "border-primary-500 ring-1 ring-primary-500 shadow-md dark:border-primary-400 dark:ring-primary-400"
              : "border-neutral-200 dark:border-neutral-700 shadow-sm"
          }
        `}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* CHECKBOX */}
            {selectable && (
              <div
                className={`
                  w-5 h-5 rounded border flex items-center justify-center transition-colors mr-2
                  ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                  }
                `}
              >
                {isSelected && <Check size={14} strokeWidth={3} />}
              </div>
            )}

            {/* AVATAR */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${avatarColorClass}`}
            >
              {avatarChar.toUpperCase()}
            </div>

            {/* INFO */}
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white text-lg leading-tight flex items-center gap-2">
                {title}
                {isPending && (
                  <span className="text-[10px] bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 px-2 py-0.5 rounded-full font-medium">
                    Pendente
                  </span>
                )}
              </h3>
              {subtitle && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
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
                 ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                 : "text-neutral-300 dark:text-neutral-600 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-700 group-hover:text-neutral-500"
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
            className="flex-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 py-3 rounded-lg font-medium flex items-center justify-center gap-2 active:bg-primary-100 dark:active:bg-primary-900/40 transition-colors"
          >
            <Pencil size={18} /> Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setIsExpanded(false);
            }}
            className="flex-1 bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 py-3 rounded-lg font-medium flex items-center justify-center gap-2 active:bg-danger-100 dark:active:bg-danger-900/40 transition-colors"
          >
            <Trash2 size={18} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}
