import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { Select } from "../../ui/Select";
import { api } from "../../../lib/axios";
import { toast } from "sonner";
import type { Farm } from "../../../contexts/FarmContext";

interface FarmFormModalProps {
  farm: Farm | null; // null = create, Farm = edit
  onClose: () => void;
  onSaved: () => void;
}

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export function FarmFormModal({ farm, onClose, onSaved }: FarmFormModalProps) {
  const [name, setName] = useState(farm?.name || "");
  const [ie, setIe] = useState(farm?.inscricaoEstadual || "");
  const [city, setCity] = useState(farm?.city || "");
  const [state, setState] = useState(farm?.state || "");
  const [address, setAddress] = useState(farm?.address || "");
  const [totalArea, setTotalArea] = useState(farm?.totalAreaHa?.toString() || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("O nome da propriedade é obrigatório.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        inscricaoEstadual: ie || null,
        city: city || null,
        state: state || null,
        address: address || null,
        totalAreaHa: totalArea ? parseFloat(totalArea) : null,
      };

      if (farm) {
        await api.put(`/farms/${farm.id}`, payload);
        toast.success("Propriedade atualizada!");
      } else {
        await api.post("/farms", payload);
        toast.success("Propriedade criada!");
      }
      onSaved();
    } catch {
      toast.error("Erro ao salvar propriedade.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-lg border border-neutral-100 dark:border-neutral-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
          <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
            {farm ? "Editar Propriedade" : "Nova Propriedade"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label>Nome da Propriedade *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fazenda São João"
              autoFocus
            />
          </div>

          <div>
            <Label>Inscrição Estadual (IE)</Label>
            <Input
              value={ie}
              onChange={(e) => setIe(e.target.value)}
              placeholder="000.000.000.000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cidade</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">Selecione</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label>Endereço</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Estrada Municipal, Km 5"
            />
          </div>

          <div>
            <Label>Área Total (hectares)</Label>
            <Input
              type="number"
              value={totalArea}
              onChange={(e) => setTotalArea(e.target.value)}
              placeholder="250"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-neutral-100 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {farm ? "Salvar" : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}
