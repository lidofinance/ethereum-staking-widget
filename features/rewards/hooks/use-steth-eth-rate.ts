import { constants } from 'ethers';
import { useLidoSWR, useSDK } from '@lido-sdk/react';

import { CHAINS } from 'consts/chains';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { stEthEthRequest } from 'features/rewards/fetchers/requesters';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';

export const useStethEthRate = () => {
  const { chainId } = useSDK();
  const mainnetStaticRpcProvider = useMainnetStaticRpcProvider();

  const swrResult = useLidoSWR(
    `steth-eth-${chainId}`,
    async () => {
      if (
        [CHAINS.Mainnet, CHAINS.Sepolia, CHAINS.Holesky].indexOf(
          chainId as CHAINS,
        ) > -1
      ) {
        const stEthEth = await stEthEthRequest(mainnetStaticRpcProvider);
        return stEthEth;
      }

      return constants.WeiPerEther;
    },
    STRATEGY_LAZY,
  );

  return swrResult;
};
