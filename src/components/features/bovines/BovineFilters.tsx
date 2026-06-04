import { Search, Filter, X, Archive } from 'lucide-react';
import { useState } from 'react';
import { Select } from '../../ui/Select';
import { Label } from '../../ui/Label';

interface BovineFiltersProps {
  filters: any;
  setFilters: (f: any) => void;
  herds: any[] | undefined;
  extraActions?: React.ReactNode;
}

const STATUS_TABS = [
  { value: "VIVO", label: "Ativos", color: "text-green-600 dark:text-green-400 border-green-500" },
  { value: "VENDIDO", label: "Vendidos", color: "text-amber-600 dark:text-amber-400 border-amber-500" },
  { value: "MORTO", label: "Mortos", color: "text-danger-600 dark:text-danger-400 border-danger-500" },
  { value: "", label: "Todos", color: "text-neutral-600 dark:text-neutral-400 border-neutral-500" },
];

export function BovineFilters({ filters, setFilters, herds, extraActions }: BovineFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = [filters.herdId, filters.gender].filter(Boolean).length;

  return (
    <div className="mb-6 space-y-3">
      {/* STATUS SEGMENT BAR */}
      <div className="flex bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-1 shadow-sm">
        {STATUS_TABS.map((tab) => {
          const isActive = filters.status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setFilters({ ...filters, status: tab.value })}
              className={`
                flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer
                ${isActive
                  ? `bg-neutral-100 dark:bg-neutral-700 ${tab.color}`
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
                }
              `}
            >
              {tab.label}
              {tab.value === "" && filters.status === "" && (
                <Archive size={12} className="inline ml-1 opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      {/* SEARCH BAR */}
      <div className="flex gap-2">
        <div className="flex-1 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center px-4 py-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-secondary-500">
          <Search size={20} className="text-neutral-400 mr-3" />
          <input
            type="text"
            placeholder="Buscar por nome, brinco ou raça..."
            className="bg-transparent outline-none w-full text-neutral-700 dark:text-white placeholder-neutral-400"
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button onClick={() => setFilters({ ...filters, search: '' })} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            p-3 rounded-xl border shadow-sm transition-all relative cursor-pointer
            ${isExpanded || activeFiltersCount > 0
              ? 'bg-secondary-50 border-secondary-200 text-secondary-600 dark:bg-secondary-900/20 dark:border-secondary-800 dark:text-secondary-400'
              : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400'}
          `}
        >
          <Filter size={20} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {extraActions}
      </div>

      {/* EXPANDABLE FILTER PANEL (Herd + Gender only, status is now in tabs) */}
      {isExpanded && (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {/* Rebanho */}
            <div>
              <Label className="text-xs">Rebanho</Label>
              <Select
                className="py-2 text-sm"
                value={filters.herdId}
                onChange={e => setFilters({ ...filters, herdId: e.target.value })}
              >
                <option value="">Todos</option>
                {herds?.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </Select>
            </div>

            {/* Gênero */}
            <div>
              <Label className="text-xs">Gênero</Label>
              <Select
                className="py-2 text-sm"
                value={filters.gender}
                onChange={e => setFilters({ ...filters, gender: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="MACHO">Macho</option>
                <option value="FEMEA">Fêmea</option>
              </Select>
            </div>

            {/* Limpar */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: '', herdId: '', status: 'VIVO', gender: '' })}
                className="w-full py-2.5 text-sm text-neutral-600 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600 rounded-lg transition-colors font-medium cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}