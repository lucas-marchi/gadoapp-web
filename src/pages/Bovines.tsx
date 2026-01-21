import { useState, useEffect } from 'react';
import { useModals } from '../contexts/ModalContext';
import { useBovinesController } from '../hooks/controllers/useBovinesController';
import { MobileHeader } from '../components/layout/MobileHeader';
import { SyncIndicator } from '../components/features/shared/SyncIndicator';
import { BovineFilters } from '../components/features/bovines/BovineFilters';
import { BatchActionBar } from '../components/features/shared/BatchActionBar';
import { Plus, CheckSquare } from 'lucide-react';
import { DataCard } from '../components/ui/DataCard';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { MoveBovinesModal } from '../components/features/bovines/MoveBovinesModal';

export function Bovines() {
  const { openBovineModal } = useModals();

  const {
    bovines,
    herds,
    deleteModalOpen,
    setDeleteModalOpen,
    bovineToDelete,
    requestDelete,
    confirmDelete,
    filters,
    setFilters,
    selectedIds,
    toggleSelection,
    clearSelection,
    batchDelete,
    moveModalOpen,
    setMoveModalOpen,
    openMoveModal,
    confirmMove
  } = useBovinesController();

  // Modo de seleção
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Sincroniza modo de seleção: Se selecionou algo, ativa o modo.
  useEffect(() => {
    if (selectedIds.length > 0) setIsSelectionMode(true);
  }, [selectedIds]);

  const handleLongPress = (id: number) => {
    setIsSelectionMode(true);
    toggleSelection(id);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const getHerdName = (id?: number) => {
    return herds?.find((h) => h.id === id)?.name || "Sem Rebanho";
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans pb-24 transition-colors duration-300">
      
      <MobileHeader title="Meus Bovinos" />

      {/* HEADER DESKTOP */}
      <div className="hidden md:flex justify-between items-center max-w-3xl mx-auto pt-8 px-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
          Meus Bovinos
        </h1>
        <SyncIndicator />
      </div>

      <main className="max-w-3xl mx-auto p-4">
        
        {/* BARRA DE FERRAMENTAS (Filtros + Botão Seleção) */}
        <div className="flex gap-2 mb-6 items-start">
          <div className="flex-1">
             <BovineFilters filters={filters} setFilters={setFilters} herds={herds} />
          </div>
          
          {/* Botão Modo Seleção (Desktop/Mobile Manual) */}
          <button 
             onClick={() => {
               const newMode = !isSelectionMode;
               setIsSelectionMode(newMode);
               if (!newMode) clearSelection();
             }}
             className={`
               p-3 rounded-xl border shadow-sm transition-all h-[50px] w-[50px] flex items-center justify-center
               ${isSelectionMode 
                 ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400' 
                 : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400'}
             `}
             title="Seleção em Lote"
           >
             <CheckSquare size={20} />
           </button>
        </div>

        {/* LISTA */}
        {!bovines ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {bovines.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="bg-neutral-100 dark:bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400 dark:text-neutral-500">
                  <Plus size={32} />
                </div>
                <h3 className="text-neutral-900 dark:text-white font-medium mb-1">
                  Nenhum bovino
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Cadastre seus animais aqui.
                </p>
              </div>
            ) : (
              bovines.map((bovine) => (
                <DataCard
                  key={bovine.id}
                  title={bovine.name}
                  subtitle={
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300">
                        {getHerdName(bovine.herdId)}
                      </span>
                      <span>{bovine.breed || "Sem raça"}</span>
                      <span>•</span>
                      <span>{bovine.status}</span>
                    </div>
                  }
                  avatarChar={bovine.name.charAt(0)}
                  avatarColorClass={
                    bovine.gender === "MACHO"
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                      : "bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400"
                  }
                  status={bovine.syncStatus}
                  
                  // PROPS DE SELEÇÃO (Adicionadas)
                  selectable={isSelectionMode}
                  isSelected={selectedIds.includes(bovine.id!)}
                  onSelect={() => toggleSelection(bovine.id!)}
                  onLongPress={() => handleLongPress(bovine.id!)}

                  onEdit={() => openBovineModal(bovine.id, bovine)}
                  onDelete={() =>
                    bovine.id && requestDelete(bovine.id, bovine.name)
                  }
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* FAB (Mobile) - Esconde se estiver selecionando */}
      {!isSelectionMode && (
        <button
            onClick={() => openBovineModal()}
            className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-secondary-600 hover:bg-secondary-500 text-white rounded-full shadow-lg shadow-secondary-600/30 flex items-center justify-center active:scale-90 transition-transform z-20"
        >
            <Plus size={28} />
        </button>
      )}

      {/* BARRA DE AÇÕES EM LOTE */}
      <BatchActionBar 
        count={selectedIds.length}
        onClear={() => {
            clearSelection();
            setIsSelectionMode(false);
        }}
        onDelete={batchDelete}
        onMove={openMoveModal}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={`Excluir ${bovineToDelete?.name}?`}
        message="Esta ação é irreversível."
        confirmText="Excluir Bovino"
        isDangerous
        confirmKeyword={bovineToDelete?.name}
      />

        <MoveBovinesModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        onConfirm={confirmMove}
        count={selectedIds.length}
      />
    </div>
  );
}