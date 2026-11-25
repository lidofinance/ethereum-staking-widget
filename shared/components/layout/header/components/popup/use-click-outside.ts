import { useEffect } from 'react';

export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  onClickOutside: () => void,
  enabled = true,
) => {
  useEffect(() => {
    if (!enabled) return;

    // pointerdown covers mouse, touch and pen per press, not per device
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Node ? event.target : null;
      if (ref.current && !ref.current.contains(target)) {
        onClickOutside();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [ref, onClickOutside, enabled]);
};
