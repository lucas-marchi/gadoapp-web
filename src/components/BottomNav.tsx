import { Link, useLocation } from 'react-router-dom';
import { Layers, Beef } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe pt-2 px-6 flex justify-around items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      
      <Link 
        to="/" 
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
          isActive('/') 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        <Layers size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Rebanhos</span>
      </Link>

      <Link 
        to="/bovines" 
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
          isActive('/bovines') 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        <Beef size={24} strokeWidth={isActive('/bovines') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Bovinos</span>
      </Link>

    </nav>
  );
}