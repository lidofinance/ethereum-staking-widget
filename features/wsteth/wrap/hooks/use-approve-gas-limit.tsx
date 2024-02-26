import { BigNumber } from 'ethers';
import { useWeb3 } from 'reef-knot/web3-react';
import {
  useLidoSWR,
  useSTETHContractRPC,
  useWSTETHContractRPC,
} from '@lido-sdk/react';

import { WSTETH_APPROVE_GAS_LIMIT } from 'consts/tx';
import { STRATEGY_IMMUTABLE } from 'consts/swr-strategies';

import { getConfig } from 'config';
const { ESTIMATE_ACCOUNT, ESTIMATE_AMOUNT } = getConfig();

export const useApproveGasLimit = () => {
  const steth = useSTETHContractRPC();
  const wsteth = useWSTETHContractRPC();
  const { chainId } = useWeb3();

  const { data } = useLidoSWR(
    ['swr:approve-wrap-gas-limit', chainId],
    async (_key, chainId) => {
      if (!chainId) return;

      try {
        const gasLimit = await steth.estimateGas.approve(
          wsteth.address,
          ESTIMATE_AMOUNT,
          { from: ESTIMATE_ACCOUNT },
        );
        return gasLimit;
      } catch (error) {
        console.warn(_key, error);
        return BigNumber.from(WSTETH_APPROVE_GAS_LIMIT);
      }
    },
    STRATEGY_IMMUTABLE,
  );

  return data ?? WSTETH_APPROVE_GAS_LIMIT;
};
