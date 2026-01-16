import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { toast } from "sonner";
import { useSync } from "../../contexts/SyncContext";

export function useBovinesController() {
  const { syncNow } = useSync();

  // 1. Listas Reativas (Dexie)
  const bovines = useLiveQuery(() =>
    db.bovines.filter((b) => b.active !== false).toArray()
  );

  // Rebanhos ativos (para o Select)
  const herds = useLiveQuery(() =>
    db.herds.filter((h) => h.active !== false).toArray()
  );

  // 2. Estados de UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    status: "VIVO", // VIVO, MORTO, VENDIDO
    gender: "MACHO", // MACHO, FEMEA
    breed: "",
    weight: "",
    birth: "",
    description: "",
    herdId: "", // String para facilitar o select (converte pra number no save)
    momId: "",
    dadId: "",
  });

  // Estados de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bovineToDelete, setBovineToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // 3. Helpers de Modal
  function openCreateModal() {
    setEditingId(null);
    setFormData({
      name: "",
      status: "VIVO",
      gender: "MACHO",
      breed: "",
      weight: "",
      birth: new Date().toISOString().split("T")[0], // Hoje YYYY-MM-DD
      description: "",
      herdId: "",
      momId: "",
      dadId: "",
    });
    setIsModalOpen(true);
  }

  function openEditModal(bovine: any) {
    setEditingId(bovine.id);
    setFormData({
      name: bovine.name,
      status: bovine.status,
      gender: bovine.gender,
      breed: bovine.breed || "",
      weight: bovine.weight?.toString() || "",
      birth: bovine.birth
        ? new Date(bovine.birth).toISOString().split("T")[0]
        : "",
      description: bovine.description || "",
      herdId: bovine.herdId?.toString() || "",
      momId: bovine.momId?.toString() || "",
      dadId: bovine.dadId?.toString() || "",
    });
    setIsModalOpen(true);
  }

  // 4. Salvar (Create/Update)
  async function saveBovine(e: React.FormEvent) {
    e.preventDefault();

    // Validações Básicas
    if (!formData.name.trim()) {
      toast.error("O nome/brinco é obrigatório.");
      return;
    }
    if (!formData.herdId) {
      toast.error("Selecione um rebanho.");
      return;
    }
    if (!formData.birth) {
      toast.error("A data de nascimento é obrigatória.");
      return;
    }

    try {
      // Define o status correto com tipagem forte
      const newSyncStatus: "updated" | "created" = editingId
        ? "updated"
        : "created";

      const payload = {
        name: formData.name,
        status: formData.status,
        gender: formData.gender,
        breed: formData.breed,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        birth: new Date(formData.birth).toISOString(),
        description: formData.description,
        herdId: parseInt(formData.herdId),
        momId: formData.momId ? parseInt(formData.momId) : undefined,
        dadId: formData.dadId ? parseInt(formData.dadId) : undefined,
        active: true,
        syncStatus: newSyncStatus,
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await db.bovines.update(editingId, payload);
        toast.success("Bovino atualizado!");
      } else {
        await db.bovines.add({
          ...payload,
          syncStatus: "created",
        });
        toast.success("Bovino cadastrado!");
      }

      setIsModalOpen(false);
      syncNow();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar.");
    }
  }

  // 5. Excluir
  function requestDelete(id: number, name: string) {
    setBovineToDelete({ id, name });
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (bovineToDelete) {
      toast.promise(
        async () => {
          await db.bovines.update(bovineToDelete.id, {
            active: false,
            syncStatus: "deleted",
            updatedAt: new Date().toISOString(),
          });
          syncNow();
        },
        {
          loading: "Excluindo...",
          success: "Bovino excluído",
          error: "Erro ao excluir",
        }
      );
    }
  }

  return {
    bovines,
    herds,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    editingId,
    openCreateModal,
    openEditModal,
    saveBovine,
    deleteModalOpen,
    setDeleteModalOpen,
    bovineToDelete,
    requestDelete,
    confirmDelete,
  };
}
