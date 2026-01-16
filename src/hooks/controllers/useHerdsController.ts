import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { toast } from 'sonner';
import { useSync } from '../../contexts/SyncContext';
import { useModals } from '../../contexts/ModalContext';

export function useHerdsController() {
  const { syncNow } = useSync();
  
  const herds = useLiveQuery(() => db.herds.filter(h => h.active !== false).toArray());
  
  const { isHerdModalOpen, openHerdModal, closeHerdModal } = useModals();

  const [nameInput, setNameInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedHerdId, setSelectedHerdId] = useState<number | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [herdToDelete, setHerdToDelete] = useState<{ id: number; name: string } | null>(null);

  const isModalOpen = isHerdModalOpen;
  const setIsModalOpen = (open: boolean) => open ? openHerdModal() : closeHerdModal()

  function openCreateModal() {
    setEditingId(null);
    setNameInput('');
    setIsModalOpen(true);
    setSelectedHerdId(null);
  }

  function openEditModal(herd: any) {
    if (herd.id) {
      setEditingId(herd.id);
      setNameInput(herd.name);
      setIsModalOpen(true);
      setSelectedHerdId(null);
    }
  }

  async function saveHerd(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error("O nome do rebanho é obrigatório.");
      return;
    }

    try {
      const existing = await db.herds
        .where('name').equals(nameInput.trim())
        .filter(h => h.active !== false)
        .first();

      if (existing && existing.id !== editingId) {
        toast.warning('Já existe um rebanho com este nome!');
        return;
      }

      if (editingId) {
        await db.herds.update(editingId, {
          name: nameInput,
          syncStatus: 'updated',
          updatedAt: new Date().toISOString()
        });
        toast.success("Rebanho atualizado!");
      } else {
        await db.herds.add({
          name: nameInput,
          active: true,
          syncStatus: 'created',
          updatedAt: new Date().toISOString()
        });
        toast.success("Rebanho criado!");
      }
      
      setIsModalOpen(false);
      syncNow();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar localmente.");
    }
  }

  async function deleteHerd(id: number) {
    toast.promise(
      async () => {
        await db.herds.update(id, {
          active: false,
          syncStatus: 'deleted',
          updatedAt: new Date().toISOString()
        });
        setSelectedHerdId(null);
        syncNow();
      },
      {
        loading: 'Excluindo...',
        success: 'Rebanho excluído',
        error: 'Erro ao excluir'
      }
    );
  }

  function requestDelete(id: number, name: string) {
    setHerdToDelete({ id, name });
    setDeleteModalOpen(true);
    setSelectedHerdId(null);
  }

  function confirmDelete() {
    if (herdToDelete) {
      deleteHerd(herdToDelete.id);
    }
  }

  return {
    herds,
    isModalOpen,
    setIsModalOpen,
    nameInput,
    setNameInput,
    editingId,
    selectedHerdId,
    setSelectedHerdId,
    openCreateModal,
    openEditModal,
    saveHerd,
    deleteModalOpen,
    setDeleteModalOpen,
    herdToDelete,
    requestDelete,
    confirmDelete
  };
}