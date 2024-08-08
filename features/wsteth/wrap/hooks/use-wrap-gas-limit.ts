import { useWeb3 } from 'reef-knot/web3-react';
import { useLidoSWR, useWSTETHContractRPC } from '@lido-sdk/react';

import { config } from 'config';
import { WRAP_FROM_ETH_GAS_LIMIT, WRAP_GAS_LIMIT } from 'consts/tx';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { applyGasLimitRatio } from 'utils/apply-gas-limit-ratio';

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
          return applyGasLimitRatio(
            await staticRpcProvider.estimateGas({
              from: config.ESTIMATE_ACCOUNT,
              to: wsteth.address,
              value: config.ESTIMATE_AMOUNT,
            }),
          );
        } catch (error) {
          console.warn(`${_key}::[eth]`, error);
          return applyGasLimitRatio(WRAP_FROM_ETH_GAS_LIMIT);
        }
      };

      const fetchGasLimitStETH = async () => {
        try {
          return await wsteth.estimateGas.wrap(config.ESTIMATE_AMOUNT, {
            from: config.ESTIMATE_ACCOUNT,
          });
        } catch (error) {
          console.warn(`${_key}::[steth]`, error);
          return WRAP_GAS_LIMIT;
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
    gasLimitStETH: data?.gasLimitStETH || WRAP_GAS_LIMIT,
  };
};
