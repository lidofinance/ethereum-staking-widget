import { Address } from 'viem';
import type { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';

import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import { useLidoQuery } from 'shared/hooks/use-lido-query';

export const useContractAddress = (contractName: LIDO_CONTRACT_NAMES) => {
  const { core } = useLidoSDK();

  return useLidoQuery<Address | `0x${string}` | undefined>({
    queryKey: ['use-contract-address', core.chainId, contractName],
    enabled: !!core && !!core.chainId,
    strategy: STRATEGY_CONSTANT,
    queryFn: async () => {
      const address = await core.getContractAddress(contractName);
      return address;
    },
  });
};
