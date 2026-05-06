import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center",
        "bg-slate-100 text-slate-500 hover:bg-slate-200",
        "dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
        className
      )}
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon size={18} className="animate-in fade-in zoom-in spin-in-90 duration-300" />
      ) : (
        <Sun size={18} className="animate-in fade-in zoom-in spin-in-90 duration-300" />
      )}
    </button>
  );
}
