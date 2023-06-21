import { useMemo } from 'react';
import { useRouter } from 'next/router';

export const useSafeQueryString = (extraParams?: Record<string, string>) => {
  const { ref, embed, app } = useRouter().query;

  return useMemo(() => {
    const queryParams = new URLSearchParams();
    if (ref && typeof ref === 'string') {
      queryParams.append('ref', ref);
    }
    if (embed && typeof embed === 'string') {
      queryParams.append('embed', embed);
    }
    if (app && typeof app === 'string') {
      queryParams.append('app', app);
    }

    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => queryParams.append(k, v));
    }
    const qs = queryParams.toString();
    return qs ? '?' + qs : '';
  }, [ref, embed, app, extraParams]);
};
