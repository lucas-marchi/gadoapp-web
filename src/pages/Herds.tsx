import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../contexts/AuthContext';
import { SyncIndicator } from '../components/SyncIndicator';
import { useSync } from '../hooks/useSync'; // <--- Importado
import { Plus, Trash2, Pencil, X, LogOut } from 'lucide-react';

// Interface para tipagem do objeto vindo do Dexie
interface LocalHerd {
  id?: number;
  name: string;
  active: boolean;
  syncStatus: string;
}

export function Herds() {
  // Hook de Sync para disparar atualizações automáticas
  const { syncNow } = useSync(); // <--- Hook instanciado

  // Lê do banco local em tempo real!
  const herds = useLiveQuery(() => 
    db.herds.filter(h => h.active !== false).toArray()
  );
  
  const [nameInput, setNameInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const { logout } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      // Validação de duplicidade local
      const existing = await db.herds
        .where('name').equals(nameInput.trim())
        .filter(h => h.active !== false)
        .first();

      if (existing && existing.id !== editingId) {
        alert('Já existe um rebanho com este nome!');
        return;
      }

      if (editingId) {
        // Edição Local
        await db.herds.update(editingId, {
          name: nameInput,
          syncStatus: 'updated',
          updatedAt: new Date().toISOString()
        });
      } else {
        // Criação Local
        await db.herds.add({
          name: nameInput,
          active: true,
          syncStatus: 'created',
          updatedAt: new Date().toISOString()
        });
      }
      
      setNameInput('');
      setEditingId(null);

      // AUTO-SYNC: Tenta enviar imediatamente
      syncNow();

    } catch (error) {
      console.error("Erro ao salvar no Dexie:", error);
      alert("Erro ao salvar localmente.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza?')) return;
    
    try {
      // Soft Delete Local
      await db.herds.update(id, {
        active: false,
        syncStatus: 'deleted',
        updatedAt: new Date().toISOString()
      });

      // AUTO-SYNC: Tenta enviar imediatamente
      syncNow();

    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  }

  function startEditing(herd: LocalHerd) {
    if (herd.id) {
      setEditingId(herd.id);
      setNameInput(herd.name);
    }
  }

  function cancelEditing() {
    setEditingId(null);
    setNameInput('');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <img src="/vite.svg" alt="Logo" className="w-8 h-8" /> 
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Meus Rebanhos</h1>
          </div>
          <button 
            onClick={logout}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
          >
            <LogOut size={18} />
            Sair
          </button>
        </header>

        {/* Formulário */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {editingId ? 'Editar Rebanho' : 'Novo Rebanho'}
          </h2>
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              id="herdInput"
              type="text"
              placeholder="Ex: Gado de Leite, Pasto Norte..."
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
            />
            
            {editingId ? (
              <>
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-6 rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  Salvar
                </button>
                <button 
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-100 text-gray-600 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors shadow-blue-200 shadow-lg"
              >
                <Plus size={20} />
                Criar
              </button>
            )}
          </form>
        </div>

        {/* Lista */}
        {!herds ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {herds.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400 mb-2">Você ainda não tem rebanhos.</p>
                <p className="text-sm text-gray-400">Crie um acima para começar a gerenciar seu gado.</p>
              </div>
            ) : (
              herds.map(herd => (
                <div 
                  key={herd.id} 
                  className={`group bg-white p-5 rounded-xl border transition-all duration-200 flex justify-between items-center
                    ${editingId === herd.id ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                      ${editingId === herd.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'}
                    `}>
                      {herd.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                        {herd.name}
                        {herd.syncStatus !== 'synced' && (
                          <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                            Pendente
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {herd.active ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(herd)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => herd.id && handleDelete(herd.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Indicador Flutuante */}
      <SyncIndicator />
    </div>
  );
}