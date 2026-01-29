import { Pencil, Trash2, Check } from "lucide-react";
import { useLongPress } from "../../hooks/ui/useLongPress";

interface DataCardProps {
  title: string;
  subtitle?: React.ReactNode;
  avatarChar: string;
  avatarColorClass?: string;
  status?: string;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onLongPress?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export function DataCard({
  title,
  subtitle,
  avatarChar,
  avatarColorClass = "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
  status,
  onEdit,
  onDelete,
  onClick,
  selectable,
  isSelected,
  onSelect,
  onLongPress,
  variant = 'primary',
}: DataCardProps) {
  const isPending = status && status !== "synced";

  const handleInteraction = () => {
    if (selectable && onSelect) {
      onSelect();
    } else if (onClick) {
      onClick();
    }
  };

  const longPressProps = useLongPress(
    () => {
      if (onLongPress) onLongPress();
    },
    handleInteraction,
    { delay: 500 },
  );

  const stopPropagation = (e: any) => {
    e.stopPropagation();
  };

  const variantStyles = {
    primary: {
      selectedBorder: "border-primary-500 ring-1 ring-primary-500",
      selectedBg: "bg-primary-50/30",
      checkbox: "bg-primary-500 border-primary-500",
      hoverBorder: "hover:border-primary-300 dark:hover:border-primary-700",
      editButton: "hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30",
    },
    secondary: {
      selectedBorder: "border-secondary-500 ring-1 ring-secondary-500",
      selectedBg: "bg-secondary-50/30",
      checkbox: "bg-secondary-500 border-secondary-500",
      hoverBorder: "hover:border-secondary-300 dark:hover:border-secondary-700",
      editButton: "hover:text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/30",
    },
    tertiary: {
      selectedBorder: "border-tertiary-500 ring-1 ring-tertiary-500",
      selectedBg: "bg-tertiary-50/30",
      checkbox: "bg-tertiary-500 border-tertiary-500",
      hoverBorder: "hover:border-tertiary-300 dark:hover:border-tertiary-700",
      editButton: "hover:text-tertiary-600 hover:bg-tertiary-50 dark:hover:bg-tertiary-900/30",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`relative transition-all duration-200 ${isSelected ? "scale-[0.98]" : ""}`}
    >
      <div
        {...longPressProps}
        className={`
          group relative bg-white dark:bg-neutral-800 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none
          hover:shadow-md ${styles.hoverBorder}
          ${isSelected ? `${styles.selectedBorder} ${styles.selectedBg}` : "border-neutral-200 dark:border-neutral-700 shadow-sm"}
        `}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {selectable && (
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? `${styles.checkbox} text-white` : "border-neutral-300"}`}
              >
                {isSelected && <Check size={12} strokeWidth={4} />}
              </div>
            )}

            <div
              className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold ${avatarColorClass}`}
            >
              {avatarChar.toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-neutral-900 dark:text-white text-lg leading-tight flex items-center gap-2 truncate">
                {title}
                {isPending && (
                  <span className="text-[10px] bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full">
                    Pendente
                  </span>
                )}
              </h3>
              {subtitle && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Ações Desktop (Hover) */}
          <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              onMouseDown={stopPropagation}
              onMouseUp={stopPropagation}
              onTouchStart={stopPropagation}
              onTouchEnd={stopPropagation}
              className={`p-2 text-neutral-400 rounded-lg ${styles.editButton}`}
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              onMouseDown={stopPropagation}
              onMouseUp={stopPropagation}
              onTouchStart={stopPropagation}
              onTouchEnd={stopPropagation}
              className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
