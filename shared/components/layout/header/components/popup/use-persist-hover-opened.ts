import { useEffect } from 'react';

export type OpenedBy = 'hover' | 'press' | 'keyboard';

// survives header remounts on page navigation
const hoverOpenedMenus = new Set<string>();

export const isHoverOpenedPersisted = (persistKey?: string) =>
  !!persistKey && hoverOpenedMenus.has(persistKey);

export const forgetHoverOpened = (persistKey?: string) => {
  if (persistKey) hoverOpenedMenus.delete(persistKey);
};

export const usePersistHoverOpened = (
  persistKey: string | undefined,
  openedBy: OpenedBy | null,
) => {
  useEffect(() => {
    if (!persistKey) return;
    if (openedBy === 'hover') hoverOpenedMenus.add(persistKey);
    else hoverOpenedMenus.delete(persistKey);
  }, [persistKey, openedBy]);
};
