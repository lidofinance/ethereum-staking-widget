/* eslint-disable @typescript-eslint/no-empty-function */
import { useEffect, useMemo, useRef } from 'react';

type Resolver<T> = {
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  isResolved: boolean;
  isRejected: boolean;
};

const createAwaiter = <T>() => {
  const resolver: Resolver<T> = {
    isResolved: false,
    isRejected: false,
    resolve: () => {},
    reject: () => {},
  };
  const awaiter = new Promise<T>((resolve, reject) => {
    resolver.resolve = (value) => {
      resolver.isResolved = true;
      resolve(value);
    };
    resolver.reject = (reason) => {
      resolver.isResolved = true;
      resolver.isRejected = true;
      reject(reason);
    };
  });
  return { awaiter, resolver };
};

// this return up-to-date promise that resolves if value is trueish
// helps async functions to wait for stalled data
export const useAwaiter = <T>(value: T | undefined, timeout = 10) => {
  const awaiterState = useRef(useMemo(() => createAwaiter<T>(), []));

  useEffect(() => {
    let awaiter = awaiterState.current;
    if (awaiter.resolver.isResolved) {
      awaiter = createAwaiter();
      awaiterState.current = awaiter;
    }
    if (value) {
      awaiterState.current.resolver.resolve(value);
    }
  }, [timeout, value]);
  return awaiterState.current;
};
