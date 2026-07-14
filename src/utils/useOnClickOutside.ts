import { useEffect } from 'react';
import type { RefObject } from 'react';

/** Calls `handler` when a mousedown happens outside of `ref`'s element. */
export function useOnClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [ref, handler]);
}
