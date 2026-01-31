import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-full bg-neutral-200/50 dark:bg-white/10 backdrop-blur-sm border border-neutral-300 dark:border-white/20 text-neutral-800 dark:text-white hover:bg-neutral-300/50 dark:hover:bg-white/20 transition-all shadow-lg active:scale-95"
            aria-label="Toggle theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
