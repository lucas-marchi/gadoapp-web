import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { Select } from "../../ui/Select";
import { Textarea } from "../../ui/Textarea";
import type { Bovine } from "../../../db/db";
import { useModals } from "../../../contexts/ModalContext";

interface BirthFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { calfId?: number; birthDate: string; notes?: string }) => void;
  allBovines: Bovine[];
  motherId?: number;
}

export function BirthFormModal({ isOpen, onClose, onSave, allBovines, motherId }: BirthFormModalProps) {
  const [calfId, setCalfId] = useState("");
  const [birthDate, setBirthDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const { openBovineModal } = useModals();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;

    onSave({
      calfId: calfId ? parseInt(calfId) : undefined,
      birthDate: new Date(birthDate).toISOString(),
      notes: notes || undefined,
    });
    setCalfId("");
    setBirthDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    onClose();
  };

  const handleCreateNewCalf = () => {
    // Pre-populate the bovine form with this mother as momId
    openBovineModal(undefined, {
      name: "",
      status: "VIVO",
      gender: "MACHO",
      breed: "",
      birth: birthDate,
      momId: motherId,
    } as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white dark:bg-neutral-800 w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-700">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-white">
            Registrar Nascimento
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full text-neutral-500 dark:text-neutral-400"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label>Data de Nascimento *</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div>
            <Label>Cria (bovino cadastrado)</Label>
            <Select
              value={calfId}
              onChange={(e) => setCalfId(e.target.value)}
            >
              <option value="">Nenhum (não cadastrado)</option>
              {allBovines.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Inline create calf button */}
          <button
            type="button"
            onClick={handleCreateNewCalf}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-secondary-300 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 rounded-xl text-sm font-medium hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors"
          >
            <Plus size={16} />
            Criar Novo Bovino como Cria
          </button>

          <div>
            <Label>Observações</Label>
            <Textarea
              className="min-h-[60px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Parto normal, sem complicações..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-secondary-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-secondary-200 dark:shadow-none active:scale-[0.98] transition-transform"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
