import { useRef, useCallback, useEffect } from 'react';

export const useElementResize = <T extends Element = HTMLDivElement>(
  onResize: (value: { width: number; height: number }) => (() => void) | void,
): React.MutableRefObject<T | null> => {
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const handleResize = useCallback(() => {
    if (!elementRef.current) return;

    const { width, height } = elementRef.current.getBoundingClientRect();

    return onResize({ width, height });
  }, [onResize]);

  useEffect(() => {
    if (!elementRef.current) return;

    observerRef.current = new ResizeObserver(handleResize);
    observerRef.current.observe(elementRef.current);
    const disposer = handleResize();

    return (): void => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (disposer) disposer();
    };
  }, [handleResize, elementRef]);

  return elementRef;
};
