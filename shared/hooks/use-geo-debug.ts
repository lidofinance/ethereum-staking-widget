import { useQuery } from '@tanstack/react-query';
import { standardFetcher } from 'utils/standardFetcher';
import { API_ROUTES } from 'consts/api';

// fix it
//
type GeoDebugResponse = {
  country: string;
  viaCloudflare: boolean;
  values: {
    'cf-ipcountry': string;
    'cf-ipcontinent': string | null;
    'cf-region-code': string | null;
    'cf-timezone': string | null;
    'accept-language': string;
  };
  presence: {
    'cf-connecting-ip': boolean;
    'cf-ipcity': boolean;
    'cf-iplatitude': boolean;
    'cf-iplongitude': boolean;
    'cf-postal-code': boolean;
    'x-forwarded-for': boolean;
    'x-real-ip': boolean;
  };
};

export const useGeoDebug = () => {
  const { data, isLoading } = useQuery<GeoDebugResponse>({
    queryKey: ['geo-debug'],
    queryFn: async () => {
      return await standardFetcher(API_ROUTES.GEO_DEBUG);
    },
  });

  return {
    data,
    isLoading,
  };
};
