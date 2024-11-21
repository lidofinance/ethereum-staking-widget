import type { Address } from 'viem';
import type {
  LIDO_CONTRACT_NAMES,
  LIDO_L2_CONTRACT_NAMES,
} from '@lidofinance/lido-ethereum-sdk/common';
import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';

import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import { useLidoQuery } from 'shared/hooks/use-lido-query';

export const useContractAddress = (
  contractName: LIDO_CONTRACT_NAMES | LIDO_L2_CONTRACT_NAMES,
) => {
  const { isL2, core } = useLidoSDK();

  return useLidoQuery<Address | null>({
    queryKey: ['use-contract-address', core.chainId, isL2, contractName],
    enabled: !!core && !!core.chainId,
    strategy: STRATEGY_CONSTANT,
    queryFn: async () => {
      if (isL2) {
        // LIDO_L2_CONTRACT_ADDRESSES[core.chainId] have only 'wsteth' and 'steth' contract names
        return (
          LIDO_L2_CONTRACT_ADDRESSES[core.chainId]?.[
            contractName as LIDO_L2_CONTRACT_NAMES
          ] ?? null
        );
      }

      return await core.getContractAddress(contractName as LIDO_CONTRACT_NAMES);
    },
  });
};
