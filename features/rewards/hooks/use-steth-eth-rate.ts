import { constants } from 'ethers';
import { useContractSWR } from '@lido-sdk/react';
import { createContractGetter } from '@lido-sdk/contracts';

import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';
import { PartialCurveAbiAbi__factory } from 'generated';
import { useDappStatus } from 'modules/web3';

const getCurveContract = createContractGetter(PartialCurveAbiAbi__factory);
export const MAINNET_CURVE = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022';

export const useStethEthRate = () => {
  const { chainId } = useDappStatus();
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
