import { useLiveQuery } from 'dexie-react-hooks';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useModals } from '../../../contexts/ModalContext';
import { useSync } from '../../../contexts/SyncContext';
import { db } from '../../../db/db';
import { bovineService, type BovineDTO } from '../../../services/bovineService';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Select } from '../../ui/Select';
import { Textarea } from '../../ui/Textarea';

export function BovineFormModal() {
  const { isBovineModalOpen, closeBovineModal, bovineEditingId, bovineInitialData } = useModals();
  const { syncNow } = useSync();
  const herds = useLiveQuery(() => db.herds.filter(h => h.active !== false).toArray());
  const allBovines = useLiveQuery(() => db.bovines.filter(b => b.active !== false).toArray());
  const potentialMoms = allBovines?.filter(b => b.gender === 'FEMEA' && b.id !== bovineEditingId) || [];
  const potentialDads = allBovines?.filter(b => b.gender === 'MACHO' && b.id !== bovineEditingId) || [];


  const [formData, setFormData] = useState({
    name: '',
    status: 'VIVO',
    gender: 'MACHO',
    breed: '',
    weight: '',
    birth: '',
    description: '',
    herdId: '',
    momId: '',
    dadId: ''
  });

  useEffect(() => {
    if (isBovineModalOpen) {
      if (bovineInitialData) {
        setFormData({
          name: bovineInitialData.name,
          status: bovineInitialData.status,
          gender: bovineInitialData.gender,
          breed: bovineInitialData.breed || '',
          weight: bovineInitialData.weight?.toString() || '',
          birth: bovineInitialData.birth ? new Date(bovineInitialData.birth).toISOString().split('T')[0] : '',
          description: bovineInitialData.description || '',
          herdId: bovineInitialData.herdId?.toString() || '',
          momId: bovineInitialData.momId?.toString() || '',
          dadId: bovineInitialData.dadId?.toString() || ''
        });
      } else {
        setFormData({
          name: '',
          status: 'VIVO',
          gender: 'MACHO',
          breed: '',
          weight: '',
          birth: new Date().toISOString().split('T')[0],
          description: '',
          herdId: '',
          momId: '',
          dadId: ''
        });
      }
    }
  }, [isBovineModalOpen, bovineInitialData]);

  if (!isBovineModalOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.herdId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      const dto: BovineDTO = {
        name: formData.name,
        status: formData.status,
        gender: formData.gender,
        breed: formData.breed,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        birth: new Date(formData.birth).toISOString(),
        description: formData.description,
        herdId: parseInt(formData.herdId),
        momId: formData.momId ? parseInt(formData.momId) : undefined,
        dadId: formData.dadId ? parseInt(formData.dadId) : undefined,
      };

      await bovineService.save(dto, bovineEditingId || undefined);

      toast.success(bovineEditingId ? "Bovino atualizado" : "Bovino criado");
      closeBovineModal();
      syncNow();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeBovineModal} />

      <div className="bg-white dark:bg-neutral-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
            {bovineEditingId ? 'Editar Bovino' : 'Novo Bovino'}
          </h2>
          <button onClick={closeBovineModal} className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full text-neutral-500 dark:text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome e Brinco */}
            <div>
              <Label>Nome / Brinco *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Mimosa, 154"
              />
            </div>

            {/* Rebanho (Select) */}
            <div>
              <Label>Rebanho *</Label>
              <Select
                value={formData.herdId}
                onChange={(e) =>
                  setFormData({ ...formData, herdId: e.target.value })
                }
              >
                <option value="">Selecione...</option>
                {herds?.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Gênero */}
              <div>
                <Label>Gênero</Label>
                <Select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="MACHO">Macho</option>
                  <option value="FEMEA">Fêmea</option>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="VIVO">Vivo</option>
                  <option value="MORTO">Morto</option>
                  <option value="VENDIDO">Vendido</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Raça */}
              <div>
                <Label>Raça</Label>
                <Input
                  type="text"
                  value={formData.breed}
                  onChange={(e) =>
                    setFormData({ ...formData, breed: e.target.value })
                  }
                  placeholder="Ex: Nelore"
                />
              </div>

              {/* Peso */}
              <div>
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Data Nascimento */}
            <div>
              <Label>Data de Nascimento *</Label>
              <Input
                type="date"
                value={formData.birth}
                onChange={(e) =>
                  setFormData({ ...formData, birth: e.target.value })
                }
              />
            </div>

            {/* Mãe e Pai (Select) */}
            <div>
              <Label>Mãe</Label>
              <Select
                value={formData.momId}
                onChange={e => setFormData({ ...formData, momId: e.target.value })}
              >
                <option value="">Nenhuma</option>
                {potentialMoms.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Pai</Label>
              <Select
                value={formData.dadId}
                onChange={e => setFormData({ ...formData, dadId: e.target.value })}
              >
                <option value="">Nenhum</option>
                {potentialDads.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>

            {/* Descrição */}
            <div>
              <Label>Observações</Label>
              <Textarea
                className="min-h-[80px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detalhes adicionais..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-secondary-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-secondary-200 dark:shadow-none active:scale-[0.98] transition-transform mt-4"
            >
              Salvar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}