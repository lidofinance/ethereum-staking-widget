import { useMemo } from 'react';
import { useRouter } from 'next/router';

export const useSafeQueryString = (extraParams?: Record<string, string>) => {
  const { ref, embed, app } = useRouter().query;

  return useMemo(() => {
    const queryParams = new URLSearchParams();
    // mix required and extra params
    Object.entries({ ref, embed, app, ...(extraParams ?? {}) }).forEach(
      ([k, v]) => v && typeof v === 'string' && queryParams.append(k, v),
    );
    const qs = queryParams.toString();
    return qs ? '?' + qs : '';
  }, [ref, embed, app, extraParams]);
};
