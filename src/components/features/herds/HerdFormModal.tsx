import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModals } from '../../../contexts/ModalContext';
import { useSync } from '../../../contexts/SyncContext';
import { toast } from 'sonner';
import { herdService } from '../../../services/herdService';

export function HerdFormModal() {
  const { isHerdModalOpen, closeHerdModal, herdEditingId, herdInitialData } = useModals();
  const { syncNow } = useSync();
  const [name, setName] = useState('');

  useEffect(() => {
    if (isHerdModalOpen) {
      setName(herdInitialData?.name || '');
    } else {
      setName('');
    }
  }, [isHerdModalOpen, herdInitialData]);

  if (!isHerdModalOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
        toast.error("Nome obrigatório");
        return;
    }

    try {
      await herdService.save({ name }, herdEditingId || undefined);
      
      toast.success(herdEditingId ? "Rebanho atualizado" : "Rebanho criado");
      closeHerdModal();
      syncNow();
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeHerdModal} />
      
      <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
            {herdEditingId ? 'Editar Rebanho' : 'Novo Rebanho'}
          </h2>
          <button onClick={closeHerdModal} className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full text-neutral-500 dark:text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="label-text">Nome do Rebanho</label>
          <input
            autoFocus
            type="text"
            className="input-field mb-6"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Gado de Leite"
          />
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary-200 dark:shadow-none active:scale-[0.98] transition-transform">
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}