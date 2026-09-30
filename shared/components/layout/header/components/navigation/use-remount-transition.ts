import { useEffect, useState } from 'react';

// Layout remounts per page: a value starts from the last mount and animates to the new one.
// undefined means "no value": nothing to animate from, and the rendered value is kept.
export const createRemountTransition = <T>() => {
  let last: T | undefined;

  return function useRemountTransition(value: T | undefined) {
    const [rendered, setRendered] = useState(() => last ?? value);

    useEffect(() => {
      last = value;
      if (value === undefined) return;
      const frame = requestAnimationFrame(() => setRendered(value));
      return () => cancelAnimationFrame(frame);
    }, [value]);

    return rendered;
  };
};
