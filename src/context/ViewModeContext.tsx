import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ViewMode = 'auto' | 'mobile' | 'desktop';

const STORAGE_KEY = 'hotelflow-view-mode';
const DESKTOP_QUERY = '(min-width: 900px)';

function readStoredMode(): ViewMode {
  if (typeof window === 'undefined') return 'auto';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'mobile' || stored === 'desktop' || stored === 'auto' ? stored : 'auto';
}

interface ViewModeContextValue {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  /** Resolved boolean — true when the desktop layout should render, whether
   * because the visitor explicitly chose it or because "auto" resolved to a
   * wide viewport. Components should read this instead of `mode` directly. */
  isDesktop: boolean;
}

const ViewModeContext = createContext<ViewModeContextValue | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>(readStoredMode);
  const [systemIsDesktop, setSystemIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_QUERY).matches : false,
  );

  // "Auto" tracks the real viewport live, so resizing the browser (or
  // rotating a tablet) reflows without needing a manual toggle.
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setSystemIsDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const setMode = (next: ViewMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const isDesktop = mode === 'auto' ? systemIsDesktop : mode === 'desktop';

  return <ViewModeContext.Provider value={{ mode, setMode, isDesktop }}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error('useViewMode must be used within ViewModeProvider');
  return ctx;
}
