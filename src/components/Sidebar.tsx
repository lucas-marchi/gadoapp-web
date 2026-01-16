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
          : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      <Icon size={22} />
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-600/20">
          <img
            src="/vite.svg"
            alt="Logo"
            className="w-6 h-6 brightness-0 invert"
          />
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
          GadoApp
        </h1>
      </div>

      {/* BOTÃO NOVO (Dropdown) */}
      <div className="px-2 mb-6 relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-between transition-all active:scale-[0.98]"
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
          <div className="absolute top-full left-2 right-2 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
            <button
              onClick={() => {
                openHerdModal();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-200 transition-colors"
            >
              <Layers size={18} className="text-blue-500" />
              Rebanho
            </button>
            <button
              onClick={() => {
                openBovineModal();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-200 transition-colors border-t border-gray-100 dark:border-gray-700"
            >
              <Beef size={18} className="text-green-500" />
              Bovino
            </button>

            {/* Futuro: Lote */}
            <button
              disabled
              className="w-full text-left px-4 py-3 flex items-center gap-3 text-gray-400 cursor-not-allowed border-t border-gray-100 dark:border-gray-700"
            >
              <span className="text-xs font-bold border border-gray-200 rounded px-1">
                EM BREVE
              </span>
              Lote
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        {/* REBANHOS (Azul) */}
        <Link
          to="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
            isActive("/")
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <Layers size={22} />
          <span>Rebanhos</span>
        </Link>

        {/* BOVINOS (Verde) */}
        <Link
          to="/bovines"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
            isActive("/bovines")
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium"
              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <Beef size={22} />
          <span>Bovinos</span>
        </Link>
      </nav>

      {/* Footer da Sidebar */}
      <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
