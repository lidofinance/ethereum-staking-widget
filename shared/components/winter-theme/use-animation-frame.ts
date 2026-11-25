import { useEffect, useRef } from 'react';

// rAF loop that pauses while the tab is hidden.
// `callback` gets the frame time and the elapsed time in 60 fps frames.
export const useAnimationFrame = (
  callback: (time: number, dt: number) => void,
  active: boolean,
): void => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.max(0, Math.min(50, now - last)) / 16.67;
      last = now;
      callbackRef.current(now, dt);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active]);
};
