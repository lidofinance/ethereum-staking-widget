import { useRef, useEffect } from 'react';
import type { MutableRefObject } from 'react';

export const usePrevious = <T>(
  value: T,
): MutableRefObject<T | undefined>['current'] => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
