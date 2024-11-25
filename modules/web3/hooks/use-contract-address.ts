import type { Address } from 'viem';
import { useQuery } from '@tanstack/react-query';
import type {
  LIDO_CONTRACT_NAMES,
  LIDO_L2_CONTRACT_NAMES,
} from '@lidofinance/lido-ethereum-sdk/common';
import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';

import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';

export const useContractAddress = (
  contractName: LIDO_CONTRACT_NAMES | LIDO_L2_CONTRACT_NAMES,
) => {
  const { isL2, core } = useLidoSDK();

  return useQuery<Address | null>({
    queryKey: ['use-contract-address', core.chainId, isL2, contractName],
    enabled: !!core && !!core.chainId,
    ...STRATEGY_CONSTANT,
    queryFn: () => {
      if (isL2) {
        // LIDO_L2_CONTRACT_ADDRESSES[core.chainId] have only 'wsteth' and 'steth' contract names
        return (
          LIDO_L2_CONTRACT_ADDRESSES[core.chainId]?.[
            contractName as LIDO_L2_CONTRACT_NAMES
          ] ?? null
        );
      }

      return core.getContractAddress(contractName as LIDO_CONTRACT_NAMES);
    },
  });
};
