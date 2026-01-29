import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { toast } from "sonner";
import { useSync } from "../../contexts/SyncContext";
import { useSelection } from "../useSelection";
import { bovineService, type BovineDTO } from "../../services/bovineService";
import { useSearchParams } from "react-router-dom";

const INITIAL_FORM_STATE = {
  name: "",
  status: "VIVO",
  gender: "MACHO",
  breed: "",
  weight: "",
  birth: new Date().toISOString().split("T")[0],
  description: "",
  herdId: "",
  momId: "",
  dadId: "",
};

export function useBovinesController() {
  const { syncNow } = useSync();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({ search: "", herdId: searchParams.get("herdId") || "", status: "", gender: "" });
  
  const bovines = useLiveQuery(() => bovineService.list(filters), [filters]);
  const herds = useLiveQuery(() => db.herds.filter((h) => h.active !== false).toArray());

  const selection = useSelection(bovines, (b) => b.id!);

  const [modals, setModals] = useState({
    createEdit: false,
    move: false,
    delete: false
  });
  
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [bovineToDelete, setBovineToDelete] = useState<{ id: number; name: string } | null>(null);

  const toggleModal = (modal: keyof typeof modals, state: boolean) => {
    setModals(prev => ({ ...prev, [modal]: state }));
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.herdId) params.set('herdId', filters.herdId);
    if (filters.status) params.set('status', filters.status);
    if (filters.gender) params.set('gender', filters.gender);
    if (filters.search) params.set('search', filters.search);
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  function openCreateModal() {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
    toggleModal('createEdit', true);
  }

  function openEditModal(bovine: any) {
    setEditingId(bovine.id);
    setFormData({
      name: bovine.name,
      status: bovine.status,
      gender: bovine.gender,
      breed: bovine.breed || "",
      weight: bovine.weight?.toString() || "",
      birth: bovine.birth ? new Date(bovine.birth).toISOString().split("T")[0] : "",
      description: bovine.description || "",
      herdId: bovine.herdId?.toString() || "",
      momId: bovine.momId?.toString() || "",
      dadId: bovine.dadId?.toString() || "",
    });
    toggleModal('createEdit', true);
  }

  async function saveBovine(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Nome obrigatório.");
    if (!formData.herdId) return toast.error("Rebanho obrigatório.");
    if (!formData.birth) return toast.error("Nascimento obrigatório.");

    try {
      const dto: BovineDTO = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        herdId: parseInt(formData.herdId),
        momId: formData.momId ? parseInt(formData.momId) : undefined,
        dadId: formData.dadId ? parseInt(formData.dadId) : undefined,
      };

      await bovineService.save(dto, editingId || undefined);
      
      toast.success(editingId ? "Bovino atualizado!" : "Bovino cadastrado!");
      toggleModal('createEdit', false);
      syncNow();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar.");
    }
  }

  async function batchDelete() {
    if (!selection.selectedIds.length || !confirm(`Excluir ${selection.selectedIds.length} bois?`)) return;
    
    await bovineService.batchDelete(selection.selectedIds);
    selection.clear();
    syncNow();
    toast.success("Bovinos excluídos");
  }

  async function batchUpdateStatus(status: string) {
    if (!selection.selectedIds.length) return;
    
    try {
      await bovineService.batchUpdateStatus(selection.selectedIds, status);
      selection.clear();
      syncNow();
      toast.success(`Status atualizado para ${status}`);
    } catch (error) {
      toast.error("Erro ao atualizar status em lote");
    }
  }

  async function batchMove(targetHerdId: number) {
    await bovineService.batchMove(selection.selectedIds, targetHerdId);
    toggleModal('move', false);
    selection.clear();
    syncNow();
    toast.success("Bovinos movidos");
  }

  async function confirmDeleteSingle() {
    if (!bovineToDelete) return;
    
    toast.promise(
      async () => {
        await bovineService.delete(bovineToDelete.id);
        syncNow();
        toggleModal('delete', false);
      },
      { loading: "Excluindo...", success: "Bovino excluído", error: "Erro ao excluir" }
    );
  }

  return {
    bovines,
    herds,
    filters,
    setFilters,
    bovineToDelete,
    selection, 
    formData,
    setFormData,
    editingId,
    saveBovine,
    modals,
    openCreateModal,
    openEditModal,
    requestDelete: (id: number, name: string) => {
       setBovineToDelete({ id, name });
       toggleModal('delete', true);
    },
    confirmDeleteSingle,
    closeModals: () => setModals({ createEdit: false, move: false, delete: false }),
    batchDelete,
    batchUpdateStatus,
    batchMove,
    openMoveModal: () => selection.selectedIds.length > 0 && toggleModal('move', true),
  };
}