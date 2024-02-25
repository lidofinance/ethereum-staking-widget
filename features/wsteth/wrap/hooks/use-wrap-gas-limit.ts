import { useLidoSWR, useWSTETHContractRPC } from '@lido-sdk/react';
import { useWeb3 } from 'reef-knot/web3-react';
import { CHAINS } from '@lido-sdk/constants';

import {
  WRAP_FROM_ETH_GAS_LIMIT,
  WRAP_GAS_LIMIT,
  WRAP_GAS_LIMIT_GOERLI,
} from 'consts/tx';

import { getConfig } from 'config';
const { ESTIMATE_ACCOUNT, ESTIMATE_AMOUNT } = getConfig();

import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { applyGasLimitRatio } from 'features/stake/stake-form/utils';

export const useWrapGasLimit = () => {
  const wsteth = useWSTETHContractRPC();
  const { chainId } = useWeb3();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();

  const { data } = useLidoSWR(
    ['[swr:wrap-gas-limit]', chainId],
    async (_key, chainId) => {
      if (!chainId) return;

      const fetchGasLimitETH = async () => {
        try {
          return await staticRpcProvider.estimateGas({
            from: ESTIMATE_ACCOUNT,
            to: wsteth.address,
            value: ESTIMATE_AMOUNT,
          });
        } catch (error) {
          console.warn(`${_key}::[eth]`, error);
          return applyGasLimitRatio(WRAP_FROM_ETH_GAS_LIMIT);
        }
      };

      const fetchGasLimitStETH = async () => {
        try {
          return await wsteth.estimateGas.wrap(ESTIMATE_AMOUNT, {
            from: ESTIMATE_ACCOUNT,
          });
        } catch (error) {
          console.warn(`${_key}::[steth]`, error);
          return chainId === CHAINS.Goerli
            ? WRAP_GAS_LIMIT_GOERLI
            : WRAP_GAS_LIMIT;
        }
      };

      const [gasLimitETH, gasLimitStETH] = await Promise.all([
        fetchGasLimitETH(),
        fetchGasLimitStETH(),
      ]);

      return {
        gasLimitETH,
        gasLimitStETH,
      };
    },
  );

  return {
    gasLimitETH: data?.gasLimitETH || WRAP_FROM_ETH_GAS_LIMIT,
    gasLimitStETH:
      data?.gasLimitStETH || chainId === CHAINS.Goerli
        ? WRAP_GAS_LIMIT_GOERLI
        : WRAP_GAS_LIMIT,
  };
};
