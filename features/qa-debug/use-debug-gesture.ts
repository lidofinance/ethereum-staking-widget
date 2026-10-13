import { useEffect } from 'react';

// Elements opting into the tap gesture (e.g. the footer container).
export const QA_DEBUG_TRIGGER_ATTR = 'data-qa-debug-trigger';

const REQUIRED_TAPS = 5;
const TAP_WINDOW_MS = 3000;

// Ctrl+Alt would collide with AltGr on some Windows layouts, and typing in
// a field must never trigger the drawer.
const isEditableTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// 5 quick taps on a trigger element (skipping its links/buttons, so normal
// navigation keeps working), or Ctrl+Shift+8. Listeners are mounted only
// when `config.enableQaHelpers` is true — see QaDebugGate.
export const useDebugGesture = (onTrigger: () => void) => {
  useEffect(() => {
    let taps: number[] = [];

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest(`[${QA_DEBUG_TRIGGER_ATTR}]`)) return;
      if (target.closest('a, button')) return;

      const now = Date.now();
      taps = taps.filter((t) => now - t < TAP_WINDOW_MS);
      taps.push(now);
      if (taps.length >= REQUIRED_TAPS) {
        taps = [];
        onTrigger();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.shiftKey &&
        !event.altKey &&
        event.code === 'Digit8' &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
        onTrigger();
      }
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onTrigger]);
};
