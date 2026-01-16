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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24 transition-colors duration-300">
      {/* HEADER MOBILE */}
      <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <img
              src="/vite.svg"
              alt="Logo"
              className="w-5 h-5 brightness-0 invert"
            />
          </div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            Meus Rebanhos
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <SyncIndicator />
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-600 p-1"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* HEADER DESKTOP (Título) */}
      <div className="hidden md:flex justify-between items-center max-w-3xl mx-auto pt-8 px-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Meus Rebanhos
        </h1>
        <SyncIndicator />
      </div>

      <main className="max-w-3xl mx-auto p-4">
        {!herds ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {herds.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <Plus size={32} />
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium mb-1">
                  Nenhum rebanho
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
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
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center active:scale-90 transition-transform z-20"
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
