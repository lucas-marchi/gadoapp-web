import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UpgradeModal } from "../components/UpgradeModal";
import { useModals } from "../contexts/ModalContext";
import { useBovinesController } from "../hooks/controllers/useBovinesController";
import { MobileHeader } from "../components/layout/MobileHeader";
import { SyncIndicator } from "../components/features/shared/SyncIndicator";
import { BovineFilters } from "../components/features/bovines/BovineFilters";
import { BatchActionBar } from "../components/features/shared/BatchActionBar";
import { Plus, CheckSquare } from "lucide-react";
import { DataCard } from "../components/ui/DataCard";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { MoveBovinesModal } from "../components/features/bovines/MoveBovinesModal";

export function Bovines() {
  const { openBovineModal } = useModals();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    bovines,
    herds,
    filters,
    setFilters,
    selection,
    modals,
    closeModals,
    requestDelete,
    confirmDeleteSingle,
    batchDelete,
    batchUpdateStatus,
    batchMove,
    openMoveModal,
    bovineToDelete,
  } = useBovinesController();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const handleOpenBovineModal = () => {
    if (user?.limits && bovines) {
      if (bovines.length >= user.limits.maxBovinesPerFarm) {
        setUpgradeMessage(`Você atingiu o limite de ${user.limits.maxBovinesPerFarm} bovino(s) na propriedade atual.`);
        setShowUpgradeModal(true);
        return;
      }
    }
    openBovineModal();
  };

  useEffect(() => {
    if (selection.selectedIds.length > 0) setIsSelectionMode(true);
  }, [selection.selectedIds]);

  const handleLongPress = (id: number) => {
    setIsSelectionMode(true);
    selection.toggle(id);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const getHerdName = (id?: number) => {
    return herds?.find((h) => h.id === id)?.name || "Sem Rebanho";
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans pb-24 transition-colors duration-300">
      <MobileHeader title="Meus Bovinos" />

      <div className="hidden md:flex justify-between items-center max-w-3xl mx-auto pt-8 px-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
          Meus Bovinos
        </h1>
        <SyncIndicator />
      </div>

      <main className="max-w-3xl mx-auto p-4">
        <BovineFilters
          filters={filters}
          setFilters={setFilters}
          herds={herds}
          extraActions={
            <button
              onClick={() => {
                const newMode = !isSelectionMode;
                setIsSelectionMode(newMode);
                if (!newMode) selection.clear();
              }}
              className={`
                 p-3 rounded-xl border shadow-sm transition-all relative
                 ${
                   isSelectionMode
                     ? "bg-secondary-50 border-secondary-200 text-secondary-600 dark:bg-secondary-900/20 dark:border-secondary-800 dark:text-secondary-400"
                     : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400"
                 }
               `}
              title="Seleção em Lote"
            >
              <CheckSquare size={20} />
            </button>
          }
        />

        {!bovines ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {bovines.length === 0 ? (
              <div className="text-center py-20 px-6">
                <h3 className="text-neutral-900 dark:text-white font-medium mb-1">
                  Nenhum bovino
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Cadastre seus animais aqui.
                </p>
              </div>
            ) : (
              bovines.map((bovine) => {
                const isDead = bovine.status === "MORTO";
                const isSold = bovine.status === "VENDIDO";
                const isInactive = isDead || isSold;

                const statusBadge = isDead
                  ? "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400"
                  : isSold
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

                const statusLabel = isDead ? "Morto" : isSold ? "Vendido" : "Vivo";

                return (
                  <div key={bovine.id} className={isInactive ? "opacity-60" : ""}>
                    <DataCard
                      title={bovine.name}
                      subtitle={
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300">
                            {getHerdName(bovine.herdId)}
                          </span>
                          <span>{bovine.breed || "Sem raça"}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${statusBadge}`}>
                            {statusLabel}
                          </span>
                        </div>
                      }
                      avatarChar={bovine.name.charAt(0)}
                      avatarColorClass={
                        isInactive
                          ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500"
                          : bovine.gender === "MACHO"
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                      }
                      status={bovine.syncStatus}
                      selectable={isSelectionMode}
                      isSelected={selection.selectedIds.includes(bovine.id!)}
                      onClick={() => navigate(`/bovines/${bovine.id}`)}
                      onSelect={() => selection.toggle(bovine.id!)}
                      onLongPress={() => handleLongPress(bovine.id!)}
                      onEdit={() => openBovineModal(bovine.id, bovine)}
                      onDelete={() =>
                        bovine.id && requestDelete(bovine.id, bovine.name)
                      }
                      variant="secondary"
                    />
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {!isSelectionMode && (
        <button
          onClick={handleOpenBovineModal}
          className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-secondary-600 hover:bg-secondary-500 text-white rounded-full shadow-lg shadow-secondary-600/30 flex items-center justify-center active:scale-90 transition-transform z-20"
        >
          <Plus size={28} />
        </button>
      )}

      <BatchActionBar
        count={selection.selectedIds.length}
        onClear={() => {
          selection.clear();
          setIsSelectionMode(false);
        }}
        onDelete={batchDelete}
        onMove={openMoveModal}
        onEdit={() => {
          const id = selection.selectedIds[0];
          const bovine = bovines?.find((b) => b.id === id);
          if (bovine) openBovineModal(bovine.id, bovine);
          selection.clear();
          setIsSelectionMode(false);
        }}
        onSell={() => batchUpdateStatus("VENDIDO")}
      />

      <ConfirmModal
        isOpen={modals.delete}
        onClose={closeModals}
        onConfirm={confirmDeleteSingle}
        title={`Excluir ${bovineToDelete?.name}?`}
        message="Esta ação é irreversível."
        confirmText="Excluir Bovino"
        isDangerous
      />

      <MoveBovinesModal
        isOpen={modals.move}
        onClose={closeModals}
        onConfirm={batchMove}
        count={selection.selectedIds.length}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        message={upgradeMessage}
      />
    </div>
  );
}
