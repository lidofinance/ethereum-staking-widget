import { DependencyList, useState, useEffect } from 'react';

/*
    Slightly modified version of use-async-memo
    Author: awmleer
    Date: 2023
    Version: 1.2.4
    Availability :https://github.com/awmleer/use-async-memo/blob/master/src/index.ts
*/

export const useAsyncMemo = <T>(
  callback: () => Promise<T>,
  deps: DependencyList,
) => {
  const [result, setResult] = useState<T | undefined>(undefined);
  useEffect(() => {
    let shouldCancel = false;
    void callback().then((val) => {
      if (!shouldCancel) {
        setResult(val);
      }
    });
    return () => {
      shouldCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return result;
};
