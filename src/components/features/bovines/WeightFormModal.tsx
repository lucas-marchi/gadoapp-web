import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { Textarea } from "../../ui/Textarea";

interface WeightFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { weight: number; recordedAt: string; notes?: string }) => void;
  initialData?: { weight: number; recordedAt: string; notes?: string };
}

export function WeightFormModal({ isOpen, onClose, onSave, initialData }: WeightFormModalProps) {
  const [weight, setWeight] = useState(initialData?.weight?.toString() || "");
  const [recordedAt, setRecordedAt] = useState(
    initialData?.recordedAt
      ? new Date(initialData.recordedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState(initialData?.notes || "");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) return;

    onSave({
      weight: parseFloat(weight),
      recordedAt: new Date(recordedAt).toISOString(),
      notes: notes || undefined,
    });
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
            Registrar Peso
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
            <Label>Peso (kg) *</Label>
            <Input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 450.5"
              autoFocus
            />
          </div>

          <div>
            <Label>Data da Pesagem *</Label>
            <Input
              type="date"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              className="min-h-[60px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pesagem pré-venda..."
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
