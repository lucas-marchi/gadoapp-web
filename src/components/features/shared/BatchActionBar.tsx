import { X, Trash2, ArrowRightLeft, Pencil, ShoppingCart } from 'lucide-react';

interface BatchActionBarProps {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onMove: () => void;
  onEdit?: () => void;
  onSell?: () => void;
}

export function BatchActionBar({ count, onClear, onDelete, onMove, onEdit, onSell }: BatchActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 px-4 py-2 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 flex items-center gap-2 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 border-r border-neutral-200 dark:border-neutral-700 pr-2 mr-1">
        <button onClick={onClear} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full text-neutral-500">
            <X size={18} />
        </button>
        <span className="font-bold text-sm whitespace-nowrap text-neutral-900 dark:text-white">{count} sel.</span>
      </div>

      <div className="flex items-center gap-1">
        {count === 1 && onEdit && (
          <button onClick={onEdit} className="p-2.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-colors" title="Editar">
            <Pencil size={20} />
          </button>
        )}

        <button onClick={onMove} className="p-2.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-colors" title="Mover">
          <ArrowRightLeft size={20} />
        </button>

        <button onClick={onSell} className="p-2.5 text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/30 rounded-xl transition-colors" title="Marcar como Vendido">
          <ShoppingCart size={20} />
        </button>
        
        <button onClick={onDelete} className="p-2.5 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-xl transition-colors" title="Excluir">
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}