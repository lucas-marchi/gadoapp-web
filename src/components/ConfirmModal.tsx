import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  confirmKeyword?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  confirmKeyword,
}: ConfirmModalProps) {
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    if (isOpen) setInputValue('');
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmDisabled = confirmKeyword 
    ? inputValue !== confirmKeyword 
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white dark:bg-neutral-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${isDangerous ? 'bg-danger-100 text-danger-600 dark:bg-danger-900/30' : 'bg-primary-100 text-primary-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
              {message}
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            <X size={20} />
          </button>
        </div>

        {/* INPUT DE SEGURANÇA */}
        {confirmKeyword && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Digite <span className="font-bold text-neutral-800 dark:text-white select-all">"{confirmKeyword}"</span> para confirmar:
            </label>
            <input
              type="text"
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-danger-500 outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmKeyword}
            />
          </div>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            disabled={isConfirmDisabled}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-white font-medium shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDangerous 
                ? 'bg-danger-600 hover:bg-danger-700 shadow-danger-200 dark:shadow-none' 
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}