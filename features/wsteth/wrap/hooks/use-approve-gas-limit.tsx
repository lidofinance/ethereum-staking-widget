import { BigNumber } from 'ethers';
import { useAccount } from 'wagmi';
import {
  useLidoSWR,
  useSTETHContractRPC,
  useWSTETHContractRPC,
} from '@lido-sdk/react';

import { config } from 'config';
import { WSTETH_APPROVE_GAS_LIMIT } from 'consts/tx';
import { SDK_LEGACY_SUPPORTED_CHAINS, CHAINS } from 'consts/chains';
import { STRATEGY_IMMUTABLE } from 'consts/swr-strategies';

export const useApproveGasLimit = () => {
  const steth = useSTETHContractRPC();
  const wsteth = useWSTETHContractRPC();
  const { chainId } = useAccount();

  const { data } = useLidoSWR(
    ['swr:approve-wrap-gas-limit', chainId],
    async (_key, chainId) => {
      if (
        !chainId ||
        SDK_LEGACY_SUPPORTED_CHAINS.indexOf(chainId as CHAINS) < 0
      ) {
        return;
      }

      try {
        const gasLimit = await steth.estimateGas.approve(
          wsteth.address,
          config.ESTIMATE_AMOUNT,
          { from: config.ESTIMATE_ACCOUNT },
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
