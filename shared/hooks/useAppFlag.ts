import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const useAppFlag = () => {
  const { query, isReady } = useRouter();
  const [appFlag, setAppFlag] = useState<string | null>(() =>
    query.app && typeof query.app === 'string' ? query.app : null,
  );
  useEffect(() => {
    if (isReady) {
      setAppFlag(query.app && typeof query.app === 'string' ? query.app : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);
  return appFlag;
};
