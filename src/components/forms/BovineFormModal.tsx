import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useModals } from "../../contexts/ModalContext";
import { db } from "../../db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { useSync } from "../../contexts/SyncContext";

export function BovineFormModal() {
  const {
    isBovineModalOpen,
    closeBovineModal,
    bovineEditingId,
    bovineInitialData,
  } = useModals();
  const { syncNow } = useSync();
  const herds = useLiveQuery(() =>
    db.herds.filter((h) => h.active !== false).toArray()
  );

  const [formData, setFormData] = useState({
    name: "",
    status: "VIVO",
    gender: "MACHO",
    breed: "",
    weight: "",
    birth: "",
    description: "",
    herdId: "",
    momId: "",
    dadId: "",
  });

  useEffect(() => {
    if (isBovineModalOpen) {
      if (bovineInitialData) {
        setFormData({
          name: bovineInitialData.name,
          status: bovineInitialData.status,
          gender: bovineInitialData.gender,
          breed: bovineInitialData.breed || "",
          weight: bovineInitialData.weight?.toString() || "",
          birth: bovineInitialData.birth
            ? new Date(bovineInitialData.birth).toISOString().split("T")[0]
            : "",
          description: bovineInitialData.description || "",
          herdId: bovineInitialData.herdId?.toString() || "",
          momId: bovineInitialData.momId?.toString() || "",
          dadId: bovineInitialData.dadId?.toString() || "",
        });
      } else {
        // Reset para criar novo
        setFormData({
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
        });
      }
    }
  }, [isBovineModalOpen, bovineInitialData]);

  if (!isBovineModalOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.herdId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        status: formData.status,
        gender: formData.gender,
        breed: formData.breed,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        birth: new Date(formData.birth).toISOString(),
        description: formData.description,
        herdId: parseInt(formData.herdId),
        active: true,
        syncStatus: (bovineEditingId ? "updated" : "created") as
          | "updated"
          | "created",
        updatedAt: new Date().toISOString(),
      };

      if (bovineEditingId) {
        await db.bovines.update(bovineEditingId, payload);
        toast.success("Bovino atualizado");
      } else {
        await db.bovines.add({ ...payload, syncStatus: "created" });
        toast.success("Bovino criado");
      }
      closeBovineModal();
      syncNow();
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeBovineModal}
      />

      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {bovineEditingId ? "Editar Bovino" : "Novo Bovino"}
          </h2>
          <button
            onClick={closeBovineModal}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome e Brinco */}
          <div>
            <label className="label-text">Nome / Brinco *</label>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Mimosa, 154"
            />
          </div>

          {/* Rebanho (Select) */}
          <div>
            <label className="label-text">Rebanho *</label>
            <select
              className="input-field"
              value={formData.herdId}
              onChange={(e) =>
                setFormData({ ...formData, herdId: e.target.value })
              }
            >
              <option value="">Selecione...</option>
              {herds?.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Gênero */}
            <div>
              <label className="label-text">Gênero</label>
              <select
                className="input-field"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              >
                <option value="MACHO">Macho</option>
                <option value="FEMEA">Fêmea</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="label-text">Status</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="VIVO">Vivo</option>
                <option value="MORTO">Morto</option>
                <option value="VENDIDO">Vendido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Raça */}
            <div>
              <label className="label-text">Raça</label>
              <input
                type="text"
                className="input-field"
                value={formData.breed}
                onChange={(e) =>
                  setFormData({ ...formData, breed: e.target.value })
                }
                placeholder="Ex: Nelore"
              />
            </div>

            {/* Peso */}
            <div>
              <label className="label-text">Peso (kg)</label>
              <input
                type="number"
                className="input-field"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Data Nascimento */}
          <div>
            <label className="label-text">Data de Nascimento *</label>
            <input
              type="date"
              className="input-field"
              value={formData.birth}
              onChange={(e) =>
                setFormData({ ...formData, birth: e.target.value })
              }
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="label-text">Observações</label>
            <textarea
              className="input-field min-h-[80px]"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detalhes adicionais..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 dark:shadow-none active:scale-[0.98] transition-transform mt-4"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
