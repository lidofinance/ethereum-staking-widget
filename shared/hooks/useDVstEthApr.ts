import { useQuery } from '@tanstack/react-query';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';

type API_RESPONSE = Array<Record<string, any>>;

const API_ENDPOINT = 'https://points.mellow.finance/v1/vaults';

export const useDVstEthApr = () => {
  const result = useQuery<API_RESPONSE>({
    queryKey: ['dvsteth-apr'],
    ...STRATEGY_LAZY,
    queryFn: async () => {
      return await standardFetcher<API_RESPONSE>(API_ENDPOINT);
    },
  });

  const dvstethVaultData = result.data?.filter(
    (vault) => vault.id === 'ethereum-dvsteth',
  )[0];

  const apr = dvstethVaultData?.apr.toFixed(1);

  return {
    ...result,
    apr,
  };
};
