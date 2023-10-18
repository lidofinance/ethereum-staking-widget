import { BigNumber } from 'ethers';
import { useWeb3 } from 'reef-knot/web3-react';

import { parseEther } from '@ethersproject/units';
import { CHAINS } from '@lido-sdk/constants';
import { useLidoSWR, useWSTETHContractRPC } from '@lido-sdk/react';

import {
  ESTIMATE_ACCOUNT,
  WRAP_FROM_ETH_GAS_LIMIT,
  WRAP_GAS_LIMIT,
  WRAP_GAS_LIMIT_GOERLI,
} from 'config';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';

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
            value: parseEther('0.001'),
          });
        } catch (error) {
          console.warn(`${_key}::[eth]`, error);
          return BigNumber.from(WRAP_FROM_ETH_GAS_LIMIT);
        }
      };

      const fetchGasLimitStETH = async () => {
        try {
          return await wsteth.estimateGas.wrap(parseEther('0.0001'), {
            from: ESTIMATE_ACCOUNT,
          });
        } catch (error) {
          console.warn(`${_key}::[steth]`, error);
          return BigNumber.from(
            chainId === CHAINS.Goerli ? WRAP_GAS_LIMIT_GOERLI : WRAP_GAS_LIMIT,
          );
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
    gasLimitETH: data?.gasLimitETH || BigNumber.from(WRAP_FROM_ETH_GAS_LIMIT),
    gasLimitStETH:
      data?.gasLimitStETH || chainId === CHAINS.Goerli
        ? BigNumber.from(WRAP_GAS_LIMIT_GOERLI)
        : BigNumber.from(WRAP_GAS_LIMIT),
  };
};
