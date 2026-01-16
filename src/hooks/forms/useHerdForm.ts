import { useState, useEffect } from 'react';
import { db } from '../../db/db';
import { useModals } from '../../contexts/ModalContext';
import { toast } from 'sonner';
import { useSync } from '../../contexts/SyncContext';

export function useHerdForm() {
  const { isHerdModalOpen, closeHerdModal } = useModals();
  const { syncNow } = useSync();
  
  const [nameInput, setNameInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Reseta quando fecha
  useEffect(() => {
    if (!isHerdModalOpen) {
      setNameInput('');
      setEditingId(null);
    }
  }, [isHerdModalOpen]);
  
  async function saveHerd(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error("Nome obrigatório");
      return;
    }

    try {
      if (editingId) {
        await db.herds.update(editingId, {
          name: nameInput,
          syncStatus: 'updated',
          updatedAt: new Date().toISOString()
        });
        toast.success("Atualizado!");
      } else {
        await db.herds.add({
          name: nameInput,
          active: true,
          syncStatus: 'created',
          updatedAt: new Date().toISOString()
        });
        toast.success("Criado!");
      }
      closeHerdModal();
      syncNow();
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  }

  return {
    nameInput,
    setNameInput,
    saveHerd,
    editingId,
    setEditingId
  };
}