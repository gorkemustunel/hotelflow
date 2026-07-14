import { Icon } from './Icon';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      className="flex items-center justify-center rounded-full bg-navy-900/5 p-2 text-navy-700 ring-1 ring-line transition hover:bg-navy-900/10"
    >
      <Icon name={isDark ? 'Sun' : 'Moon'} className="h-4 w-4" />
    </button>
  );
}
