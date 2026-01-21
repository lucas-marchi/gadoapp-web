import { X, Trash2, ArrowRightLeft } from 'lucide-react';

interface BatchActionBarProps {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onMove: () => void;
}

export function BatchActionBar({ count, onClear, onDelete, onMove }: BatchActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white px-6 py-3 rounded-full shadow-2xl border border-neutral-200 dark:border-neutral-700 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      
      <div className="flex items-center gap-3 border-r border-neutral-200 dark:border-neutral-700 pr-4">
        <span className="font-bold text-sm">{count} selecionado(s)</span>
        <button onClick={onClear} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full">
            <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button 
            onClick={onMove}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
        >
            <ArrowRightLeft size={18} />
            <span className="hidden sm:inline">Mover</span>
        </button>
        
        <button 
            onClick={onDelete}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
        >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Excluir</span>
        </button>
      </div>

    </div>
  );
}