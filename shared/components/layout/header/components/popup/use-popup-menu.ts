import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';

import { useClickOutside } from './use-click-outside';
import {
  resolveTriggerPress,
  type PopupTriggerMode,
} from './resolve-trigger-press';

const HOVER_OPEN_DELAY_MS = 100;
const HOVER_CLOSE_DELAY_MS = 250;
const MENU_ITEM_SELECTOR = 'a[href], button:not([disabled])';

type OpenedBy = 'hover' | 'press' | 'keyboard';

type UsePopupMenuOptions = {
  mode: PopupTriggerMode;
  disabled?: boolean;
  // keeps a hover-opened menu open when the page remounts the header
  persistKey?: string;
};

const getMenuItems = (menu: HTMLElement | null) =>
  Array.from(menu?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? []);

const useCloseOnEscape = (opened: boolean, onEscape: () => void) => {
  useEffect(() => {
    if (!opened) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onEscape();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [opened, onEscape]);
};

// survives header remounts on page navigation
const hoverOpenedMenus = new Set<string>();

const isHoverOpenedPersisted = (persistKey?: string) =>
  !!persistKey && hoverOpenedMenus.has(persistKey);

const usePersistHoverOpened = (
  persistKey: string | undefined,
  openedBy: OpenedBy | null,
) => {
  useEffect(() => {
    if (!persistKey) return;
    if (openedBy === 'hover') hoverOpenedMenus.add(persistKey);
    else hoverOpenedMenus.delete(persistKey);
  }, [persistKey, openedBy]);
};

export const usePopupMenu = ({
  mode,
  disabled = false,
  persistKey,
}: UsePopupMenuOptions) => {
  const [openedBy, setOpenedBy] = useState<OpenedBy | null>(() =>
    isHoverOpenedPersisted(persistKey) && !disabled ? 'hover' : null,
  );
  const opened = openedBy !== null;
  const menuId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const pointerTypeRef = useRef<string>();

  const clearHoverTimer = useCallback(
    () => clearTimeout(hoverTimerRef.current),
    [],
  );

  const open = useCallback(
    (by: OpenedBy) => {
      clearHoverTimer();
      if (!disabled) setOpenedBy(by);
    },
    [clearHoverTimer, disabled],
  );

  const close = useCallback(() => {
    clearHoverTimer();
    // cleared synchronously so a navigation right after close can't restore it
    if (persistKey) hoverOpenedMenus.delete(persistKey);
    setOpenedBy(null);
  }, [clearHoverTimer, persistKey]);

  const handleEscape = useCallback(() => {
    const hadFocus = wrapperRef.current?.contains(document.activeElement);
    close();

    if (hadFocus) {
      wrapperRef.current
        ?.querySelector<HTMLElement>(`[aria-controls="${menuId}"]`)
        ?.focus();
    }
  }, [close, menuId]);

  usePersistHoverOpened(persistKey, openedBy);
  useEffect(() => {
    // restored on mount: close unless the cursor stayed on the menu
    if (openedBy !== 'hover') return;

    hoverTimerRef.current = setTimeout(() => {
      if (!wrapperRef.current?.matches(':hover')) close();
    }, HOVER_CLOSE_DELAY_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useClickOutside(wrapperRef, close);
  useCloseOnEscape(opened, handleEscape);
  useEffect(() => clearHoverTimer, [clearHoverTimer]);

  useEffect(() => {
    if (disabled) close();
  }, [disabled, close]);

  useEffect(() => {
    if (openedBy === 'keyboard') getMenuItems(menuRef.current)[0]?.focus();
  }, [openedBy]);

  const isHoverPointer = (event: PointerEvent) =>
    mode === 'link' && event.pointerType === 'mouse';

  const wrapperProps = {
    ref: wrapperRef,
    onPointerEnter: (event: PointerEvent) => {
      if (!isHoverPointer(event)) return;
      clearHoverTimer();

      if (!opened) {
        hoverTimerRef.current = setTimeout(
          () => open('hover'),
          HOVER_OPEN_DELAY_MS,
        );
      }
    },
    onPointerLeave: (event: PointerEvent) => {
      if (!isHoverPointer(event)) return;

      clearHoverTimer();
      // keyboard and press opened menus are not closed by the cursor
      if (openedBy === 'hover') {
        hoverTimerRef.current = setTimeout(close, HOVER_CLOSE_DELAY_MS);
      }
    },
    onBlur: (event: FocusEvent) => {
      // null relatedTarget means a press on a non-focusable area, handled by useClickOutside
      const next = event.relatedTarget as Node | null;
      if (next && !wrapperRef.current?.contains(next)) close();
    },
  };

  const triggerProps = {
    'aria-haspopup': true,
    'aria-expanded': opened,
    'aria-controls': menuId,
    onPointerDown: (event: PointerEvent) => {
      pointerTypeRef.current = event.pointerType;
    },
    onClick: (event: MouseEvent) => {
      const isKeyboard = event.detail === 0;
      const action = resolveTriggerPress({
        mode,
        pointerType: pointerTypeRef.current,
        isKeyboard,
        canOpen: !disabled,
      });

      pointerTypeRef.current = undefined;

      if (action === 'follow') return;

      event.preventDefault();
      if (action === 'ignore') return;
      if (opened) close();
      else open(isKeyboard ? 'keyboard' : 'press');
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' || disabled) return;
      event.preventDefault();
      // promotes a hover-opened menu so the cursor leaving won't close it
      if (openedBy === 'keyboard') getMenuItems(menuRef.current)[0]?.focus();
      else open('keyboard');
    },
  };

  const menuProps = {
    id: menuId,
    ref: menuRef,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

      event.preventDefault();
      const items = getMenuItems(menuRef.current);
      const index = items.indexOf(document.activeElement as HTMLElement);
      const step = event.key === 'ArrowDown' ? 1 : -1;

      items[(index + step + items.length) % items.length]?.focus();
    },
  };

  const backdropProps = {
    // backdrop swallows a tap outside so it only closes the menu
    $backdrop: openedBy === 'press',
    onClick: close,
  };

  return {
    opened,
    close,
    wrapperProps,
    triggerProps,
    menuProps,
    backdropProps,
  };
};
