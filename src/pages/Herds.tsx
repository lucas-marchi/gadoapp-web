import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../contexts/AuthContext';
import { SyncIndicator } from '../components/SyncIndicator';
import { useSync } from '../hooks/useSync';
import { useTheme } from '../hooks/useTheme';
import { Plus, Trash2, Pencil, X, LogOut, MoreVertical, ChevronRight, Moon, Sun } from 'lucide-react';

interface LocalHerd {
  id?: number;
  name: string;
  active: boolean;
  syncStatus: string;
}

export function Herds() {
  const { syncNow } = useSync();
  const { theme, toggleTheme } = useTheme();
  const herds = useLiveQuery(() => db.herds.filter(h => h.active !== false).toArray());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedHerdId, setSelectedHerdId] = useState<number | null>(null); // Para menu mobile
  
  const { logout } = useAuth();

  function openCreateModal() {
    setEditingId(null);
    setNameInput('');
    setIsModalOpen(true);
    setSelectedHerdId(null);
  }

  function openEditModal(herd: LocalHerd) {
    if (herd.id) {
      setEditingId(herd.id);
      setNameInput(herd.name);
      setIsModalOpen(true);
      setSelectedHerdId(null); // Fecha menu
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      const existing = await db.herds
        .where('name').equals(nameInput.trim())
        .filter(h => h.active !== false)
        .first();

      if (existing && existing.id !== editingId) {
        alert('Já existe um rebanho com este nome!');
        return;
      }

      if (editingId) {
        await db.herds.update(editingId, {
          name: nameInput,
          syncStatus: 'updated',
          updatedAt: new Date().toISOString()
        });
      } else {
        await db.herds.add({
          name: nameInput,
          active: true,
          syncStatus: 'created',
          updatedAt: new Date().toISOString()
        });
      }
      
      setIsModalOpen(false);
      syncNow();
    } catch (error) {
      alert("Erro ao salvar.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza?')) return;
    try {
      await db.herds.update(id, {
        active: false,
        syncStatus: 'deleted',
        updatedAt: new Date().toISOString()
      });
      setSelectedHerdId(null);
      syncNow();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24 transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <img src="/vite.svg" alt="Logo" className="w-5 h-5 brightness-0 invert" /> 
          </div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Meus Rebanhos</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <SyncIndicator />
          
          {/* Botão Dark Mode */}
          <button 
            onClick={toggleTheme} 
            className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button onClick={logout} className="text-gray-400 hover:text-red-600 p-1">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        
        {/* --- LISTA --- */}
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
                <h3 className="text-gray-900 dark:text-white font-medium mb-1">Nenhum rebanho</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Toque no botão + para começar.</p>
              </div>
            ) : (
              herds.map(herd => (
                <div key={herd.id} className="relative">
                  {/* Card Principal */}
                  <div 
                    onClick={() => setSelectedHerdId(selectedHerdId === herd.id ? null : herd.id ?? null)}
                    className={`
                      bg-white dark:bg-gray-800 p-4 rounded-xl border transition-all active:scale-[0.98] cursor-pointer
                      ${selectedHerdId === herd.id 
                        ? 'border-blue-500 ring-1 ring-blue-500 shadow-md dark:border-blue-400 dark:ring-blue-400' 
                        : 'border-gray-100 dark:border-gray-700 shadow-sm'}
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
                          {herd.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                            {herd.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {herd.syncStatus !== 'synced' && (
                              <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">
                                Pendente
                              </span>
                            )}
                            <span className="text-xs text-gray-400 dark:text-gray-500">0 cabeças</span>
                          </div>
                        </div>
                      </div>
                      
                      <ChevronRight 
                        size={20} 
                        className={`text-gray-300 dark:text-gray-600 transition-transform ${selectedHerdId === herd.id ? 'rotate-90' : ''}`} 
                      />
                    </div>
                  </div>

                  {/* Menu de Ações */}
                  {selectedHerdId === herd.id && (
                    <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(herd); }}
                        className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 py-3 rounded-lg font-medium flex items-center justify-center gap-2 active:bg-blue-100 dark:active:bg-blue-900/40"
                      >
                        <Pencil size={18} /> Editar
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); herd.id && handleDelete(herd.id); }}
                        className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 py-3 rounded-lg font-medium flex items-center justify-center gap-2 active:bg-red-100 dark:active:bg-red-900/40"
                      >
                        <Trash2 size={18} /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* --- FAB --- */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center active:scale-90 transition-transform z-20"
      >
        <Plus size={28} />
      </button>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div 
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingId ? 'Editar Rebanho' : 'Novo Rebanho'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome do Rebanho</label>
              <input
                autoFocus
                type="text"
                placeholder="Ex: Gado de Leite"
                className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none mb-6 placeholder-gray-400 dark:placeholder-gray-500"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
              />
              
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-none active:scale-[0.98] transition-transform"
              >
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}