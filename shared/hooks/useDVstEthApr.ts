import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';

type VaultDataPartial = {
  id: string;
  apr: number;
};
type RequestResponseData = Array<VaultDataPartial>;

const API_ENDPOINT = 'https://api.mellow.finance/v1/vaults';

export const useDVstEthApr = () => {
  const result = useQuery<RequestResponseData, Error, string>({
    queryKey: ['dvsteth-apr'],
    ...STRATEGY_LAZY,
    queryFn: async () => {
      return await standardFetcher<RequestResponseData>(API_ENDPOINT);
    },
    select: (data) => {
      invariant(data, '[useDVstEthApr] Failed to fetch API');

      const vaultData = data.find((vault) => vault.id === 'ethereum-dvsteth');
      invariant(vaultData, '[useDVstEthApr] invalid API response');

      return vaultData.apr.toFixed(1);
    },
  });

  return { apr: result.data, ...result };
};
