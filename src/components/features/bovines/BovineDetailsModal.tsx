import { X, Beef, Calendar, Weight, Info, Tag, Hash, GitBranch } from 'lucide-react';
import { useModals } from '../../../contexts/ModalContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';

export function BovineDetailsModal() {
  const { isBovineDetailsOpen, closeBovineDetails, selectedBovine } = useModals();

  const allBovines = useLiveQuery(() => db.bovines.toArray());

  if (!isBovineDetailsOpen || !selectedBovine) return null;

  const mom = allBovines?.find(b => 
    (selectedBovine.momId && b.id === selectedBovine.momId) || 
    (selectedBovine.momId && b.serverId === selectedBovine.momId)
  );

  const dad = allBovines?.find(b => 
    (selectedBovine.dadId && b.id === selectedBovine.dadId) || 
    (selectedBovine.dadId && b.serverId === selectedBovine.dadId)
  );

  const DetailItem = ({ icon: Icon, label, value, colorClass = "text-primary-600" }: any) => (
    <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-100 dark:border-neutral-700">
      <div className={`p-2 bg-white dark:bg-neutral-600 rounded-lg ${colorClass} shadow-sm`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">{label}</p>
        <p className="text-neutral-900 dark:text-white font-medium truncate">{value || '---'}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeBovineDetails} />
      
      <div className="bg-white dark:bg-neutral-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header Colorido baseado no Gênero */}
        <div className={`p-6 ${selectedBovine.gender === 'MACHO' ? 'bg-primary-600' : 'bg-accent-600'} text-white relative`}>
          <button onClick={closeBovineDetails} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-bold border border-white/30">
              {selectedBovine.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedBovine.name}</h2>
              <p className="opacity-90 flex items-center gap-2">
                <Tag size={14} /> {selectedBovine.status}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Seção: Informações Básicas */}
          <section>
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Info size={14} /> Informações Básicas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={Hash} label="Gênero" value={selectedBovine.gender} />
              <DetailItem icon={Beef} label="Raça" value={selectedBovine.breed} />
              <DetailItem icon={Calendar} label="Nascimento" value={new Date(selectedBovine.birth).toLocaleDateString()} />
              <DetailItem icon={Weight} label="Peso Atual" value={selectedBovine.weight ? `${selectedBovine.weight} kg` : '---'} />
            </div>
          </section>

          {/* Seção: Genealogia */}
          <section>
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <GitBranch size={14} /> Genealogia
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <DetailItem 
                icon={Beef} 
                label="Mãe" 
                value={mom?.name} 
                colorClass="text-accent-500" 
              />
              <DetailItem 
                icon={Beef} 
                label="Pai" 
                value={dad?.name} 
                colorClass="text-primary-500" 
              />
            </div>
          </section>

          {/* Seção: Observações */}
          {selectedBovine.description && (
            <section>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">Observações</h3>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed border border-neutral-100 dark:border-neutral-700">
                {selectedBovine.description}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
          <button 
            onClick={closeBovineDetails}
            className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold transition-transform active:scale-[0.98] shadow-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}