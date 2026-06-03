import { Moon, Sun, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/ui/useTheme';
import { useFarm } from '../../contexts/FarmContext';
import { SyncIndicator } from '../features/shared/SyncIndicator';

interface MobileHeaderProps {
  title: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { activeFarm } = useFarm();

  return (
    <header className="md:hidden bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm transition-colors">
      
      <div className="flex items-center gap-3">
        <img 
          src={theme === 'dark' ? "/logo-light.svg" : "/logo-dark.svg"} 
          alt="Logo" 
          className="h-8 w-auto" 
        />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-neutral-800 dark:text-white truncate max-w-[120px] leading-tight">
            {title}
          </h1>
          {activeFarm && (
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate max-w-[120px] leading-tight">
              {activeFarm.name}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <SyncIndicator />
        
        <button 
          onClick={toggleTheme} 
          className="p-2 text-neutral-400 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-secondary-400 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <Link 
          to="/profile" 
          className="text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 p-1 transition-colors"
        >
          <UserCircle size={22} />
        </Link>
      </div>
    </header>
  );
}