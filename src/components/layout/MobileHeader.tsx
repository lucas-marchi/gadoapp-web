import { LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/ui/useTheme';
import { SyncIndicator } from '../features/shared/SyncIndicator';

interface MobileHeaderProps {
  title: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <header className="md:hidden bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm transition-colors">
      
      <div className="flex items-center gap-3">
        <img 
          src={theme === 'dark' ? "/logo-light.svg" : "/logo-dark.svg"} 
          alt="Logo" 
          className="h-8 w-auto" 
        />
        <h1 className="text-lg font-bold text-neutral-800 dark:text-white truncate max-w-[120px]">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <SyncIndicator />
        
        <button 
          onClick={toggleTheme} 
          className="p-2 text-neutral-400 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-secondary-400 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button 
          onClick={logout} 
          className="text-neutral-400 hover:text-danger-600 p-1"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}