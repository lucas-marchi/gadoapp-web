import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

export function useDashboardController() {
  // Busca todos os dados ativos
  const bovines = useLiveQuery(() => db.bovines.filter(b => b.active !== false).toArray());
  const herds = useLiveQuery(() => db.herds.filter(h => h.active !== false).toArray());

  // Cálculos
  const totalBovines = bovines?.length || 0;
  const totalHerds = herds?.length || 0;

  // Por Gênero
  const byGender = [
    { name: 'Machos', value: bovines?.filter(b => b.gender === 'MACHO').length || 0, fill: 'rgb(var(--color-primary-600))' },
    { name: 'Fêmeas', value: bovines?.filter(b => b.gender === 'FEMEA').length || 0, fill: 'rgb(var(--color-accent-500))' },
  ];

  // Por Status
  const byStatus = [
    { name: 'Vivos', value: bovines?.filter(b => b.status === 'VIVO').length || 0, fill: 'rgb(var(--color-secondary-500))' },
    { name: 'Vendidos', value: bovines?.filter(b => b.status === 'VENDIDO').length || 0, fill: 'rgb(var(--color-neutral-500))' },
    { name: 'Mortos', value: bovines?.filter(b => b.status === 'MORTO').length || 0, fill: 'rgb(var(--color-danger-500))' },
  ];

  // Por Rebanho (Top 5)
  const byHerd = herds?.map(h => ({
    name: h.name,
    value: bovines?.filter(b => b.herdId === h.id).length || 0
  })).sort((a, b) => b.value - a.value).slice(0, 5) || [];

  return {
    totalBovines,
    totalHerds,
    byGender,
    byStatus,
    byHerd
  };
}