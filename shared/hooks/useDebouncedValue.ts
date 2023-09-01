import { useEffect, useState, useMemo } from 'react';
import debounce from 'lodash/debounce';

export const useDebouncedValue = <T>(value: T, delay: number) => {
  const [v, s] = useState(value);
  const deb = useMemo(() => debounce((_v) => s(_v), delay), [delay]);
  deb(value);
  useEffect(() => {
    return () => {
      deb.flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
  return v;
};
