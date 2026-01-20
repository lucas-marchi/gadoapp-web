import { useState } from 'react';
import { X, Layers, ArrowRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

interface MoveBovinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetHerdId: number) => void;
  count: number;
}

export function MoveBovinesModal({ isOpen, onClose, onConfirm, count }: MoveBovinesModalProps) {
  const herds = useLiveQuery(() => db.herds.filter(h => h.active !== false).toArray());
  const [selectedHerdId, setSelectedHerdId] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Mover {count} bovino(s)
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Selecione o rebanho de destino
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full text-neutral-500">
            <X size={20} />
          </button>
        </div>

        {/* Lista de Rebanhos */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
          {herds?.map(herd => (
            <button
              key={herd.id}
              onClick={() => setSelectedHerdId(herd.id!)}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl border transition-all
                ${selectedHerdId === herd.id 
                  ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500 dark:bg-primary-900/20 dark:border-primary-400' 
                  : 'bg-neutral-50 dark:bg-neutral-700/50 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${selectedHerdId === herd.id ? 'bg-primary-100 text-primary-700' : 'bg-white dark:bg-neutral-600 text-neutral-500'}`}>
                  <Layers size={20} />
                </div>
                <span className={`font-medium ${selectedHerdId === herd.id ? 'text-primary-900 dark:text-primary-100' : 'text-neutral-700 dark:text-neutral-200'}`}>
                  {herd.name}
                </span>
              </div>
              
              {selectedHerdId === herd.id && <ArrowRight size={20} className="text-primary-600 dark:text-primary-400" />}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={!selectedHerdId}
            onClick={() => selectedHerdId && onConfirm(selectedHerdId)}
            className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-primary-200 dark:shadow-none transition-all active:scale-95"
          >
            Mover
          </button>
        </div>

      </div>
    </div>
  );
}