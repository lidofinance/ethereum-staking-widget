import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

export const useSafeQueryString = (extraParams?: Record<string, string>) => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const embed = searchParams.get('embed');
  const app = searchParams.get('app');

  return useMemo(() => {
    const queryParams = new URLSearchParams();
    // mix required and extra params
    Object.entries({ ref, embed, app, ...(extraParams ?? {}) }).forEach(
      ([k, v]) => v && queryParams.append(k, v),
    );
    const qs = queryParams.toString();
    return qs ? '?' + qs : '';
  }, [ref, embed, app, extraParams]);
};
