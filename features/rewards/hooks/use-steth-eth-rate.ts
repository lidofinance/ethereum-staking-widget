import { useLidoSWR, useSDK } from '@lido-sdk/react';

import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';
import { stEthEthRequest } from 'features/rewards/fetchers/requesters';
import { constants } from 'ethers';

export const useStethEthRate = () => {
  const { chainId } = useSDK();
  const mainnetStaticRpcProvider = useMainnetStaticRpcProvider();

  const swrResult = useLidoSWR(
    `steth-eth-${chainId}`,
    async () => {
      if (chainId !== 1) {
        return constants.WeiPerEther;
      } else {
        const stEthEth = await stEthEthRequest(mainnetStaticRpcProvider);
        return stEthEth;
      }
    },
    STRATEGY_LAZY,
  );

  return swrResult;
};
