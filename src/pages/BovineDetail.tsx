import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Scale,
  Baby,
  HeartPulse,
  GitBranch,
  Info,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

import {
  type WeightUnit,
  formatWeightFromKg,
  getStoredWeightUnit,
  setStoredWeightUnit,
} from "../lib/weightUtils";

import { useBovineDetailController, type DetailTab } from "../hooks/controllers/useBovineDetailController";
import { useModals } from "../contexts/ModalContext";
import { useSync } from "../contexts/SyncContext";

import { WeightChart } from "../components/features/bovines/WeightChart";
import { WeightFormModal } from "../components/features/bovines/WeightFormModal";
import { BirthList } from "../components/features/bovines/BirthList";
import { BirthFormModal } from "../components/features/bovines/BirthFormModal";
import { HealthList } from "../components/features/bovines/HealthList";
import { HealthFormModal } from "../components/features/bovines/HealthFormModal";
import { GenealogyTree } from "../components/features/bovines/GenealogyTree";

import { weightRecordService } from "../services/weightRecordService";
import { birthRecordService } from "../services/birthRecordService";
import { healthRecordService } from "../services/healthRecordService";

export function BovineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bovineId = id ? parseInt(id) : undefined;
  const { openBovineModal } = useModals();
  const { syncNow } = useSync();

  const {
    bovine,
    herd,
    weightRecords,
    birthRecords,
    healthRecords,
    genealogyTree,
    allBovines,
  } = useBovineDetailController(bovineId);

  const [activeTab, setActiveTab] = useState<DetailTab>("info");
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(getStoredWeightUnit());

  const handleUnitChange = (unit: WeightUnit) => {
    setWeightUnit(unit);
    setStoredWeightUnit(unit);
  };

  if (!bovine) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600" />
      </div>
    );
  }

  const isFemale = bovine.gender === "FEMEA";
  const genderColor = isFemale
    ? "from-pink-500 to-pink-700"
    : "from-blue-500 to-blue-700";

  const statusLabel: Record<string, { text: string; color: string }> = {
    VIVO: { text: "Vivo", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    MORTO: { text: "Morto", color: "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400" },
    VENDIDO: { text: "Vendido", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  };
  const status = statusLabel[bovine.status] || statusLabel.VIVO;

  const age = (() => {
    const birth = new Date(bovine.birth);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    if (months < 12) return `${months} meses`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years}a ${rem}m` : `${years} anos`;
  })();

  const tabs: { key: DetailTab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { key: "info", label: "Info", icon: <Info size={16} />, show: true },
    { key: "weight", label: "Peso", icon: <Scale size={16} />, show: true },
    { key: "births", label: "Crias", icon: <Baby size={16} />, show: isFemale },
    { key: "health", label: "Saúde", icon: <HeartPulse size={16} />, show: true },
    { key: "genealogy", label: "Genealogia", icon: <GitBranch size={16} />, show: true },
  ];

  const handleSaveWeight = async (data: { weight: number; recordedAt: string; notes?: string }) => {
    if (!bovineId) return;
    await weightRecordService.save({ bovineId, ...data });
    syncNow();
    toast.success("Peso registrado!");
  };

  const handleDeleteWeight = async (recordId: number) => {
    await weightRecordService.delete(recordId);
    syncNow();
    toast.success("Registro excluído");
  };

  const handleSaveBirth = async (data: { calfId?: number; birthDate: string; notes?: string }) => {
    if (!bovineId) return;
    await birthRecordService.save({ motherId: bovineId, ...data });
    syncNow();
    toast.success("Nascimento registrado!");
  };

  const handleDeleteBirth = async (recordId: number) => {
    await birthRecordService.delete(recordId);
    syncNow();
    toast.success("Registro excluído");
  };

  const handleSaveHealth = async (data: {
    type: "VACCINE" | "MEDICATION";
    productName: string;
    appliedAt: string;
    dosage?: string;
    veterinarian?: string;
    nextDueDate?: string;
    notes?: string;
  }) => {
    if (!bovineId) return;
    await healthRecordService.save({ bovineId, ...data });
    syncNow();
    toast.success("Registro de saúde salvo!");
  };

  const handleDeleteHealth = async (recordId: number) => {
    await healthRecordService.delete(recordId);
    syncNow();
    toast.success("Registro excluído");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans pb-24 transition-colors duration-300">
      {/* HEADER */}
      <div className={`bg-gradient-to-br ${genderColor} text-white`}>
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold flex-1 truncate">{bovine.name}</h1>
            <button
              onClick={() => openBovineModal(bovine.id, bovine)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Edit size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm opacity-90">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-white/20`}>
              {status.text}
            </span>
            <span>{bovine.breed || "Sem raça"}</span>
            <span>•</span>
            <span>{isFemale ? "Fêmea" : "Macho"}</span>
            <span>•</span>
            <span>{age}</span>
            {bovine.weight && (
              <>
                <span>•</span>
                <span>{formatWeightFromKg(bovine.weight, weightUnit)}</span>
              </>
            )}
          </div>

          {herd && (
            <div className="mt-2 text-xs opacity-70">
              Rebanho: {herd.name}
            </div>
          )}
        </div>
      </div>

      {/* TAB BAR */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.filter((t) => t.show).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-secondary-600 text-secondary-600 dark:text-secondary-400 dark:border-secondary-400"
                  : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <main className="max-w-3xl mx-auto p-4">
        {/* INFO TAB */}
        {activeTab === "info" && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
              Informações
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Nome / Brinco", value: bovine.name },
                { label: "Status", value: status.text },
                { label: "Gênero", value: isFemale ? "Fêmea" : "Macho" },
                { label: "Raça", value: bovine.breed || "—" },
                { label: "Peso", value: bovine.weight
                  ? formatWeightFromKg(bovine.weight, weightUnit)
                  : "—" },
                { label: "Nascimento", value: new Date(bovine.birth).toLocaleDateString("pt-BR") },
                { label: "Idade", value: age },
                { label: "Rebanho", value: herd?.name || "—" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-sm font-medium text-neutral-800 dark:text-white mt-0.5">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            {bovine.description && (
              <div>
                <div className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Observações
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-0.5">
                  {bovine.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* WEIGHT TAB */}
        {activeTab === "weight" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                  Histórico de Peso
                </h3>
                <button
                  onClick={() => setShowWeightModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400 rounded-lg text-xs font-medium hover:bg-secondary-200 transition-colors"
                >
                  <Plus size={14} /> Registrar
                </button>
              </div>
              <WeightChart records={weightRecords} unit={weightUnit} onUnitChange={handleUnitChange} />
            </div>

            {/* Weight records list */}
            {weightRecords.length > 0 && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-6">
                <h4 className="text-sm font-bold text-neutral-800 dark:text-white mb-3">
                  Registros
                </h4>
                <div className="space-y-2">
                  {[...weightRecords].reverse().map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between py-2 border-b border-neutral-50 dark:border-neutral-700 last:border-0"
                    >
                      <div>
                        <span className="text-sm font-semibold text-neutral-800 dark:text-white">
                          {formatWeightFromKg(r.weight, weightUnit)}
                        </span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-2">
                          {new Date(r.recordedAt).toLocaleDateString("pt-BR")}
                        </span>
                        {r.notes && (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-2">
                            — {r.notes}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => r.id && handleDeleteWeight(r.id)}
                        className="p-1.5 text-neutral-400 hover:text-danger-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BIRTHS TAB */}
        {activeTab === "births" && isFemale && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                Nascimentos ({birthRecords.length})
              </h3>
              <button
                onClick={() => setShowBirthModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400 rounded-lg text-xs font-medium hover:bg-secondary-200 transition-colors"
              >
                <Plus size={14} /> Registrar
              </button>
            </div>
            <BirthList
              records={birthRecords}
              allBovines={allBovines}
              onDelete={handleDeleteBirth}
              onCalfClick={(calfId) => navigate(`/bovines/${calfId}`)}
            />
          </div>
        )}

        {/* HEALTH TAB */}
        {activeTab === "health" && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                Saúde
              </h3>
              <button
                onClick={() => setShowHealthModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400 rounded-lg text-xs font-medium hover:bg-secondary-200 transition-colors"
              >
                <Plus size={14} /> Registrar
              </button>
            </div>
            <HealthList records={healthRecords} onDelete={handleDeleteHealth} />
          </div>
        )}

        {/* GENEALOGY TAB */}
        {activeTab === "genealogy" && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-4">
              Árvore Genealógica
            </h3>
            <GenealogyTree
              tree={genealogyTree}
              onBovineClick={(bovId) => navigate(`/bovines/${bovId}`)}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      <WeightFormModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSave={handleSaveWeight}
      />
      <BirthFormModal
        isOpen={showBirthModal}
        onClose={() => setShowBirthModal(false)}
        onSave={handleSaveBirth}
        allBovines={allBovines}
      />
      <HealthFormModal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        onSave={handleSaveHealth}
      />
    </div>
  );
}
