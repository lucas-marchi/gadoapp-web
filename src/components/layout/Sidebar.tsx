import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, Beef, LogOut, Sun, Moon, Plus, ChevronDown, BarChart3, UserCircle, Building2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFarm } from '../../contexts/FarmContext';
import { useTheme } from '../../hooks/ui/useTheme';
import { useModals } from '../../contexts/ModalContext';
import { UpgradeModal } from '../../components/UpgradeModal';

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const { farms, activeFarm, switchFarm } = useFarm();
  const { theme, toggleTheme } = useTheme();
  const { openHerdModal, openBovineModal } = useModals();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFarmSelectorOpen, setIsFarmSelectorOpen] = useState(false);
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  // Local approximation for limits in sidebar since we might not have the full arrays loaded here cheaply, 
  // actually, useFarm gives activeFarm. activeFarm has herdCount and bovineCount!
  
  const handleOpenHerdModal = () => {
    if (user?.limits && activeFarm) {
      if (activeFarm.herdCount >= user.limits.maxHerdsPerFarm) {
        setUpgradeMessage(`Você atingiu o limite de ${user.limits.maxHerdsPerFarm} rebanho(s) para a propriedade no seu plano atual.`);
        setShowUpgradeModal(true);
        return;
      }
    }
    openHerdModal();
  };

  const handleOpenBovineModal = () => {
    if (user?.limits && activeFarm) {
      if (activeFarm.bovineCount >= user.limits.maxBovinesPerFarm) {
        setUpgradeMessage(`Você atingiu o limite de ${user.limits.maxBovinesPerFarm} bovino(s) para a propriedade no seu plano atual.`);
        setShowUpgradeModal(true);
        return;
      }
    }
    openBovineModal();
  };

  const isActive = (path: string) => location.pathname === path;

  const getActiveClass = (path: string) => {
    const base = "font-medium";
    if (path === '/') return `${base} bg-tertiary-50 text-tertiary-600 dark:bg-tertiary-900/20 dark:text-tertiary-400`;
    if (path === '/herds') return `${base} bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400`;
    if (path === '/bovines') return `${base} bg-secondary-50 text-secondary-600 dark:bg-secondary-900/20 dark:text-secondary-400`;
    if (path === '/reports') return `${base} bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400`;
    if (path === '/profile') return `${base} bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400`;
    return base; // Fallback
  };

  const inactiveClass = "text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-white/5";

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 p-6 z-50">

      {/* Logo */}
      <div className="flex flex-col items-center justify-center mb-6 pt-2">
        <div className="w-32 h-32 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden p-5 mb-3">
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
      </div>

      {/* FARM SELECTOR */}
      {farms.length > 0 && (
        <div className="px-2 mb-4 relative">
          <button
            onClick={() => setIsFarmSelectorOpen(!isFarmSelectorOpen)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm transition-colors"
          >
            <Building2 size={16} className="text-primary-500 flex-shrink-0" />
            <span className="flex-1 text-left truncate text-neutral-700 dark:text-neutral-200 font-medium">
              {activeFarm?.name || 'Selecione'}
            </span>
            <ChevronDown size={14} className={`text-neutral-400 transition-transform ${isFarmSelectorOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFarmSelectorOpen && (
            <div className="absolute top-full left-2 right-2 mt-1 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 overflow-hidden z-50 max-h-48 overflow-y-auto">
              {farms.map((farm) => (
                <button
                  key={farm.id}
                  onClick={() => {
                    switchFarm(farm.id);
                    setIsFarmSelectorOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-200 transition-colors"
                >
                  <span className="truncate">{farm.name}</span>
                  {activeFarm?.id === farm.id && (
                    <Check size={14} className="text-primary-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOTÃO NOVO (Dropdown) */}
      <div className="px-2 mb-6 relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-primary-200 dark:shadow-none flex items-center justify-between transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <Plus size={20} />
            <span>Novo</span>
          </div>
          <ChevronDown size={18} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-2 right-2 mt-2 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleOpenHerdModal();
              }}
              className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-3 text-neutral-700 dark:text-neutral-200 transition-colors"
            >
              <Layers size={18} className="text-primary-500" />
              Rebanho
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleOpenBovineModal();
              }}
              className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-3 text-neutral-700 dark:text-neutral-200 transition-colors border-t border-neutral-100 dark:border-neutral-700"
            >
              <Beef size={18} className="text-secondary-500" />
              Bovino
            </button>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-2">

        <Link
          to="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/') ? getActiveClass('/') : inactiveClass
            }`}
        >
          <LayoutDashboard size={22} />
          <span>Visão Geral</span>
        </Link>

        <Link
          to="/herds"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/herds') ? getActiveClass('/herds') : inactiveClass
            }`}
        >
          <Layers size={22} />
          <span>Rebanhos</span>
        </Link>

        <Link
          to="/bovines"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/bovines') ? getActiveClass('/bovines') : inactiveClass
            }`}
        >
          <Beef size={22} />
          <span>Bovinos</span>
        </Link>

        <Link
          to="/reports"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/reports') ? getActiveClass('/reports') : inactiveClass
            }`}
        >
          <BarChart3 size={22} />
          <span>Relatórios</span>
        </Link>

      </nav>

      {/* Footer da Sidebar */}
      <div className="pt-6 border-t border-neutral-100 dark:border-neutral-700 space-y-2">
        <Link
          to="/profile"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            isActive('/profile') ? getActiveClass('/profile') : inactiveClass
          }`}
        >
          <UserCircle size={20} />
          <span>Perfil</span>
        </Link>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-white/5 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white">GadoApp</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Seu manejo bovino</p>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        message={upgradeMessage}
      />
    </aside>
  );
}