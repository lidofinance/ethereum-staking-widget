import { useEffect, useMemo, useRef } from 'react';

const createAwaiter = <T>() => {
  const resolver: { resolve?: (value: T) => void; isResolved: boolean } = {
    isResolved: false,
  };
  const awaiter = new Promise<T>((resolve) => {
    resolver.resolve = (value) => {
      resolver.isResolved = true;
      resolve(value);
    };
  });
  return { awaiter, resolveAwaiter: resolver };
};

// this return up-to-date promise that resolves if value is trueish
// helps async functions to wait for stalled data
export const useAwaiter = <T>(value: T | undefined) => {
  const awaiterState = useRef(useMemo(() => createAwaiter<T>(), []));

  useEffect(() => {
    let awaiter = awaiterState.current;
    if (awaiter.resolveAwaiter.isResolved) {
      awaiter = createAwaiter();
      awaiterState.current = awaiter;
    }
    if (value) {
      awaiterState.current.resolveAwaiter.resolve?.(value);
    }
  }, [value]);
  return awaiterState.current;
};
