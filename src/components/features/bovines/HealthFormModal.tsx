import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { Select } from "../../ui/Select";
import { Textarea } from "../../ui/Textarea";

const VACCINE_CATALOG = [
  "Febre Aftosa",
  "Brucelose (B19)",
  "Raiva Bovina",
  "Clostridioses (Polivalente)",
  "IBR/BVD",
  "Leptospirose",
  "Carbúnculo Sintomático",
  "Botulismo",
  "Brucelose (RB51)",
  "Manqueira",
  "Tristeza Parasitária",
];

const MEDICATION_CATALOG = [
  "Ivermectina",
  "Doramectina",
  "Albendazol",
  "Oxitetraciclina",
  "Florfenicol",
  "Levamisol",
  "Fipronil",
  "Moxidectina",
  "Abamectina",
  "Cloridrato de Clortetraciclina",
  "ADE (Vitaminas)",
  "Anti-inflamatório (Flunixin)",
];

interface HealthFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: "VACCINE" | "MEDICATION";
    productName: string;
    appliedAt: string;
    dosage?: string;
    veterinarian?: string;
    nextDueDate?: string;
    notes?: string;
  }) => void;
}

export function HealthFormModal({ isOpen, onClose, onSave }: HealthFormModalProps) {
  const [type, setType] = useState<"VACCINE" | "MEDICATION">("VACCINE");
  const [productName, setProductName] = useState("");
  const [appliedAt, setAppliedAt] = useState(new Date().toISOString().split("T")[0]);
  const [dosage, setDosage] = useState("");
  const [veterinarian, setVeterinarian] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !appliedAt) return;

    onSave({
      type,
      productName: productName.trim(),
      appliedAt: new Date(appliedAt).toISOString(),
      dosage: dosage || undefined,
      veterinarian: veterinarian || undefined,
      nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString() : undefined,
      notes: notes || undefined,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setType("VACCINE");
    setProductName("");
    setAppliedAt(new Date().toISOString().split("T")[0]);
    setDosage("");
    setVeterinarian("");
    setNextDueDate("");
    setNotes("");
  };

  const catalog = type === "VACCINE" ? VACCINE_CATALOG : MEDICATION_CATALOG;
  const datalistId = type === "VACCINE" ? "vaccine-list" : "medication-list";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white dark:bg-neutral-800 w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-700">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-white">
            Registro de Saúde
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full text-neutral-500 dark:text-neutral-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tipo *</Label>
              <Select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as "VACCINE" | "MEDICATION");
                  setProductName("");
                }}
              >
                <option value="VACCINE">Vacina</option>
                <option value="MEDICATION">Medicamento</option>
              </Select>
            </div>

            <div>
              <Label>Produto / Nome *</Label>
              <Input
                type="text"
                list={datalistId}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={type === "VACCINE" ? "Selecione ou digite..." : "Selecione ou digite..."}
                autoFocus
              />
              <datalist id={datalistId}>
                {catalog.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data de Aplicação *</Label>
                <Input
                  type="date"
                  value={appliedAt}
                  onChange={(e) => setAppliedAt(e.target.value)}
                />
              </div>
              <div>
                <Label>Dosagem</Label>
                <Input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Ex: 5ml"
                />
              </div>
            </div>

            <div>
              <Label>Veterinário</Label>
              <Input
                type="text"
                value={veterinarian}
                onChange={(e) => setVeterinarian(e.target.value)}
                placeholder="Nome do veterinário"
              />
            </div>

            <div>
              <Label>Próxima Dose</Label>
              <Input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                className="min-h-[60px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes adicionais..."
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
    </div>
  );
}
