import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; maxWidth?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-t-3xl bg-cream-50 shadow-lifted sm:rounded-3xl animate-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-900/5 bg-cream-50/95 px-5 py-4 backdrop-blur">
            <h3 className="font-display text-lg font-semibold text-navy-900">{title}</h3>
            <button onClick={onClose} className="rounded-full p-1.5 text-navy-400 hover:bg-navy-900/5 hover:text-navy-700">
              <Icon name="X" className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
