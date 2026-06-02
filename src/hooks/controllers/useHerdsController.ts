import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { useSync } from '../../contexts/SyncContext';
import { herdService } from '../../services/herdService';
import { bovineService } from '../../services/bovineService';

export function useHerdsController() {
  const { syncNow } = useSync();
  const herds = useLiveQuery(() => herdService.list());
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [herdToDelete, setHerdToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteCattle, setDeleteCattle] = useState(false);

  function requestDelete(id: number, name: string) {
    setHerdToDelete({ id, name });
    setDeleteCattle(false);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (herdToDelete) {
      toast.promise(
        async () => {
          if (deleteCattle) {
            await bovineService.deleteByHerdId(herdToDelete.id);
          }
          await herdService.delete(herdToDelete.id);
          syncNow();
          setDeleteModalOpen(false);
        },
        { loading: "Excluindo...", success: "Rebanho excluído", error: "Erro ao excluir" }
      );
    }
  }

  return {
    herds,
    deleteModalOpen,
    setDeleteModalOpen,
    herdToDelete,
    deleteCattle,
    setDeleteCattle,
    requestDelete,
    confirmDelete,
  };
}