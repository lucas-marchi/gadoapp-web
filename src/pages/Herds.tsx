import { useAuth } from "../contexts/AuthContext";
import { SyncIndicator } from "../components/SyncIndicator";
import { useTheme } from "../hooks/useTheme";
import { useHerdsController } from "../hooks/controllers/useHerdsController";
import { ConfirmModal } from "../components/ConfirmModal";
import { useModals } from "../contexts/ModalContext";
import {
  Plus,
  Trash2,
  Pencil,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { DataCard } from "../components/DataCard";

export function Herds() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { openHerdModal } = useModals();

  const {
    herds,
    selectedHerdId,
    setSelectedHerdId,
    deleteModalOpen,
    setDeleteModalOpen,
    requestDelete,
    confirmDelete,
    herdToDelete,
  } = useHerdsController();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans pb-24 transition-colors duration-300">
      {/* HEADER MOBILE */}
      <header className="md:hidden bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden p-1.5">
            <img
              src="/logo-dark.svg"
              alt="Logo"
              className="w-full h-full object-contain dark:hidden"
            />
            <img
              src="/logo-light.svg"
              alt="Logo"
              className="w-full h-full object-contain hidden dark:block"
            />
          </div>
          <h1 className="text-lg font-bold text-neutral-800 dark:text-white">
            Meus Rebanhos
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <SyncIndicator />
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-400 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-yellow-400 transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={logout}
            className="text-neutral-400 hover:text-danger-600 p-1"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* HEADER DESKTOP (Título) */}
      <div className="hidden md:flex justify-between items-center max-w-3xl mx-auto pt-8 px-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
          Meus Rebanhos
        </h1>
        <SyncIndicator />
      </div>

      <main className="max-w-3xl mx-auto p-4">
        {!herds ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {herds.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="bg-neutral-100 dark:bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400 dark:text-neutral-500">
                  <Plus size={32} />
                </div>
                <h3 className="text-neutral-900 dark:text-white font-medium mb-1">
                  Nenhum rebanho
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Toque no botão + para começar.
                </p>
              </div>
            ) : (
              herds.map((herd) => (
                <DataCard
                  key={herd.id}
                  title={herd.name}
                  subtitle={`${herd.active ? "Ativo" : "Inativo"}`}
                  avatarChar={herd.name.charAt(0)}
                  status={herd.syncStatus}
                  onEdit={() => openHerdModal(herd.id, herd)}
                  onDelete={() => herd.id && requestDelete(herd.id, herd.name)}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* FAB (Apenas Mobile) */}
      <button
        onClick={() => openHerdModal()}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-lg shadow-primary-600/30 flex items-center justify-center active:scale-90 transition-transform z-20"
      >
        <Plus size={28} />
      </button>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={`Excluir ${herdToDelete?.name}?`}
        message="Esta ação é irreversível. Para confirmar, digite o nome do rebanho abaixo."
        confirmText="Excluir Rebanho"
        isDangerous
        confirmKeyword={herdToDelete?.name}
      />
    </div>
  );
}