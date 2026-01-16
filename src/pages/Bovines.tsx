import { useAuth } from "../contexts/AuthContext";
import { SyncIndicator } from "../components/SyncIndicator";
import { useTheme } from "../hooks/useTheme";
import { useBovinesController } from "../hooks/controllers/useBovinesController";
import { ConfirmModal } from "../components/ConfirmModal";
import { useModals } from "../contexts/ModalContext";
import {
  Plus,
  Trash2,
  Pencil,
  LogOut,
  Moon,
  Sun,
  Search,
  Filter,
} from "lucide-react";
import { DataCard } from "../components/DataCard";

export function Bovines() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { openBovineModal } = useModals();

  const {
    bovines,
    herds,
    deleteModalOpen,
    setDeleteModalOpen,
    bovineToDelete,
    requestDelete,
    confirmDelete,
  } = useBovinesController();

  const getHerdName = (id?: number) => {
    return herds?.find((h) => h.id === id)?.name || "Sem Rebanho";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24 transition-colors duration-300">
      {/* HEADER MOBILE */}
      <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white p-1.5 rounded-lg">
            <img
              src="/vite.svg"
              alt="Logo"
              className="w-5 h-5 brightness-0 invert"
            />
          </div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            Meus Bovinos
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

      {/* HEADER DESKTOP */}
      <div className="hidden md:flex justify-between items-center max-w-3xl mx-auto pt-8 px-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Meus Bovinos
        </h1>
        <SyncIndicator />
      </div>

      <main className="max-w-3xl mx-auto p-4">
        {/* BARRA DE FERRAMENTAS */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center px-4 py-3 shadow-sm">
            <Search size={20} className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Buscar por nome ou brinco..."
              className="bg-transparent outline-none w-full text-gray-700 dark:text-white placeholder-gray-400"
            />
          </div>
          <button className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 shadow-sm">
            <Filter size={20} />
          </button>
        </div>

        {/* LISTA */}
        {!bovines ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {bovines.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <Plus size={32} />
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium mb-1">
                  Nenhum bovino
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
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
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
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
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                  }
                  status={bovine.syncStatus}
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

      {/* FAB (Mobile) */}
      <button
        onClick={() => openBovineModal()}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg shadow-green-600/30 flex items-center justify-center active:scale-90 transition-transform z-20"
      >
        <Plus size={28} />
      </button>

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
    </div>
  );
}
