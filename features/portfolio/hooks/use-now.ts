import { useEffect, useState } from 'react';

// the time of this render; a tick renders again, so "N min. ago" keeps counting
export const useNow = (tickMs: number): number => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(
      () => setTick((tickCount) => tickCount + 1),
      tickMs,
    );
    return () => clearInterval(intervalId);
  }, [tickMs]);

  // read on every render: data that just arrived is not measured by an old clock
  return Date.now();
};
