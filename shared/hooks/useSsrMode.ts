import { useEffect, useState } from 'react';

export const useSsrMode = () => {
  const [ssrMode, setSsrMode] = useState(true);
  useEffect(() => setSsrMode(false), []);
  return ssrMode;
};
