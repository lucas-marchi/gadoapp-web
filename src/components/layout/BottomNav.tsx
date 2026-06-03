import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, Beef, BarChart3, UserCircle } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getActiveClass = (path: string) => {
    if (path === '/') return "bg-tertiary-50 text-tertiary-600 dark:bg-tertiary-900/20 dark:text-tertiary-400";
    if (path === '/herds') return "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400";
    if (path === '/bovines') return "bg-secondary-50 text-secondary-600 dark:bg-secondary-900/20 dark:text-secondary-400";
    if (path === '/reports') return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
    if (path === '/profile') return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    return "text-primary-600 dark:text-primary-400";
  };

  const inactiveClass = "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300";

  const NavItem = ({ to, icon: Icon, label }: any) => (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[56px] ${
        isActive(to) ? getActiveClass(to) : inactiveClass
      }`}
    >
      <Icon size={22} strokeWidth={isActive(to) ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 pb-safe pt-2 px-4 flex justify-around items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      
      <NavItem to="/" icon={LayoutDashboard} label="Início" />
      <NavItem to="/herds" icon={Layers} label="Rebanhos" />
      <NavItem to="/bovines" icon={Beef} label="Bovinos" />
      <NavItem to="/reports" icon={BarChart3} label="Relatórios" />
      <NavItem to="/profile" icon={UserCircle} label="Perfil" />

    </nav>
  );
}