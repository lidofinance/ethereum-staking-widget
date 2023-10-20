import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { useLidoSWR, useWSTETHContractRPC } from '@lido-sdk/react';
import { useWeb3 } from 'reef-knot/web3-react';
import {
  ESTIMATE_ACCOUNT,
  ESTIMATE_AMOUNT,
  getBackendRPCPath,
  WRAP_FROM_ETH_GAS_LIMIT,
  WRAP_GAS_LIMIT,
  WRAP_GAS_LIMIT_GOERLI,
} from 'config';
import { BigNumber } from 'ethers';
import { CHAINS } from '@lido-sdk/constants';

export const useWrapGasLimit = () => {
  const wsteth = useWSTETHContractRPC();
  const { chainId } = useWeb3();

  const { data } = useLidoSWR(
    ['[swr:wrap-gas-limit]', chainId],
    async (_key, chainId) => {
      if (!chainId) return;

      const provider = getStaticRpcBatchProvider(
        chainId as CHAINS,
        getBackendRPCPath(chainId as CHAINS),
      );

      const fetchGasLimitETH = async () => {
        try {
          return await provider.estimateGas({
            from: ESTIMATE_ACCOUNT,
            to: wsteth.address,
            value: ESTIMATE_AMOUNT,
          });
        } catch (error) {
          console.warn(`${_key}::[eth]`, error);
          return BigNumber.from(WRAP_FROM_ETH_GAS_LIMIT);
        }
      };

      const fetchGasLimitStETH = async () => {
        try {
          return await wsteth.estimateGas.wrap(ESTIMATE_AMOUNT, {
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
