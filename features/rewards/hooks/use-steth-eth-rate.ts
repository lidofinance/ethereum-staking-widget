import { useContractSWR, useSDK } from '@lido-sdk/react';

import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';
import { constants } from 'ethers';
import { PartialCurveAbiAbi__factory } from 'generated';
import { createContractGetter } from '@lido-sdk/contracts';

const getCurveContract = createContractGetter(PartialCurveAbiAbi__factory);
export const MAINNET_CURVE = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022';

export const useStethEthRate = () => {
  const { chainId } = useSDK();
  const mainnetStaticRpcProvider = useMainnetStaticRpcProvider();

  const contract = getCurveContract(MAINNET_CURVE, mainnetStaticRpcProvider);

  const swr = useContractSWR({
    contract,
    method: 'get_dy',
    params: [0, 1, String(10 ** 18)],
    config: STRATEGY_LAZY,
    shouldFetch: chainId === 1,
  });

  if (chainId !== 1) return constants.WeiPerEther;
  return swr.data;
};
