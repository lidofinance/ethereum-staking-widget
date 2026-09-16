import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';
import { APY_SCHEMA } from 'utils/zod';

// Only the vault we read is validated: other vaults in the list may be broken
const MELLOW_VAULTS_SCHEMA = z.array(z.looseObject({ id: z.string() }));

const API_ENDPOINT = 'https://api.mellow.finance/v1/vaults';

export const useDVstEthApr = () => {
  const result = useQuery({
    queryKey: ['dvsteth-apr'],
    ...STRATEGY_CONSTANT,
    queryFn: async () => {
      const vaults = MELLOW_VAULTS_SCHEMA.parse(
        await standardFetcher<unknown>(API_ENDPOINT),
      );
      const vaultData = vaults.find((vault) => vault.id === 'ethereum-dvsteth');
      invariant(vaultData, '[useDVstEthApr] invalid API response');

      return APY_SCHEMA.parse(vaultData.apr).toFixed(1);
    },
  });

  return { apr: result.data, ...result };
};
