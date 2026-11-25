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
import { useCloseOnEscape } from './use-close-on-escape';
import {
  forgetHoverOpened,
  isHoverOpenedPersisted,
  usePersistHoverOpened,
  type OpenedBy,
} from './use-persist-hover-opened';
import {
  resolveTriggerPress,
  type PopupTriggerMode,
} from './resolve-trigger-press';

const HOVER_OPEN_DELAY_MS = 100;
const HOVER_CLOSE_DELAY_MS = 250;
const MENU_ITEM_SELECTOR = 'a[href], button:not([disabled])';

type UsePopupMenuOptions = {
  mode: PopupTriggerMode;
  disabled?: boolean;
  // keeps a hover-opened menu open when the page remounts the header
  persistKey?: string;
};

const getMenuItems = (menu: HTMLElement | null) =>
  Array.from(menu?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? []);

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
    forgetHoverOpened(persistKey);
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
  useClickOutside(wrapperRef, close, opened);
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
      const next = event.relatedTarget;
      if (next && !wrapperRef.current?.contains(next)) close();
    },
  };

  const triggerProps = {
    'aria-expanded': opened,
    // a disabled trigger renders no menu to control
    'aria-controls': disabled ? undefined : menuId,
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
      const active = document.activeElement;
      const index = active instanceof HTMLElement ? items.indexOf(active) : -1;
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
