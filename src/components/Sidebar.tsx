import { Link, useLocation } from "react-router-dom";
import {
  Layers,
  Beef,
  LogOut,
  Sun,
  Moon,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useModals } from "../contexts/ModalContext";
import { useTheme } from "../hooks/useTheme";
import { useState } from "react";

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const { openHerdModal, openBovineModal } = useModals();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, colorClass }: any) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
        isActive(to)
          ? `bg-${colorClass}-50 text-${colorClass}-600 dark:bg-${colorClass}-900/20 dark:text-${colorClass}-400 font-medium`
          : "text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
      }`}
    >
      <Icon size={22} />
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 p-6 z-50">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center mb-10 pt-2">
        <div className="w-40 h-40 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden p-6 mb-3">
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
          <ChevronDown
            size={18}
            className={`transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-2 right-2 mt-2 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
            <button
              onClick={() => {
                openHerdModal();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-3 text-neutral-700 dark:text-neutral-200 transition-colors"
            >
              <Layers size={18} className="text-primary-500" />
              Rebanho
            </button>
            <button
              onClick={() => {
                openBovineModal();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-3 text-neutral-700 dark:text-neutral-200 transition-colors border-t border-neutral-100 dark:border-neutral-700"
            >
              <Beef size={18} className="text-secondary-500" />
              Bovino
            </button>

            {/* Futuro: Lote */}
            <button
              disabled
              className="w-full text-left px-4 py-3 flex items-center gap-3 text-neutral-400 cursor-not-allowed border-t border-neutral-100 dark:border-neutral-700"
            >
              <span className="text-xs font-bold border border-neutral-200 rounded px-1">
                EM BREVE
              </span>
              Lote
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        {/* REBANHOS (Azul -> Primary) */}
        <Link
          to="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
            isActive("/")
              ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium"
              : "text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
          }`}
        >
          <Layers size={22} />
          <span>Rebanhos</span>
        </Link>

        {/* BOVINOS (Verde -> Secondary) */}
        <Link
          to="/bovines"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
            isActive("/bovines")
              ? "bg-secondary-50 text-secondary-600 dark:bg-secondary-900/20 dark:text-secondary-400 font-medium"
              : "text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
          }`}
        >
          <Beef size={22} />
          <span>Bovinos</span>
        </Link>
      </nav>

      {/* Footer da Sidebar */}
      <div className="pt-6 border-t border-neutral-100 dark:border-neutral-700 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
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
    </aside>
  );
}
