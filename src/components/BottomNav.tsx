import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, Beef } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const activeClass = "text-primary-600 dark:text-primary-400";
  const inactiveClass = "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300";

  const NavItem = ({ to, icon: Icon, label }: any) => (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
        isActive(to) ? activeClass : inactiveClass
      }`}
    >
      <Icon size={24} strokeWidth={isActive(to) ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 pb-safe pt-2 px-6 flex justify-around items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      
      <NavItem to="/" icon={LayoutDashboard} label="Início" />
      <NavItem to="/herds" icon={Layers} label="Rebanhos" />
      <NavItem to="/bovines" icon={Beef} label="Bovinos" />

    </nav>
  );
}