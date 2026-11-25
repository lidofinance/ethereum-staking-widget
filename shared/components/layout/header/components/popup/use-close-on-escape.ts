import { useEffect } from 'react';

export const useCloseOnEscape = (opened: boolean, onEscape: () => void) => {
  useEffect(() => {
    if (!opened) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [opened, onEscape]);
};
