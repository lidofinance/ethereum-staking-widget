import { useQuery } from '@tanstack/react-query';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';

type VaultDataPartial = {
  id: string;
  apr: number;
};
type RequestResponseData = Array<VaultDataPartial>;

const API_ENDPOINT = 'https://points.mellow.finance/v1/vaults';

export const useDVstEthApr = () => {
  const result = useQuery<
    RequestResponseData,
    Error,
    VaultDataPartial | undefined
  >({
    queryKey: ['dvsteth-apr'],
    ...STRATEGY_LAZY,
    queryFn: async () => {
      return await standardFetcher<RequestResponseData>(API_ENDPOINT);
    },
    select: (data) => {
      return data.find((vault) => vault.id === 'ethereum-dvsteth');
    },
  });

  const apr = result.data?.apr.toFixed(1);

  return {
    ...result,
    apr,
  };
};
