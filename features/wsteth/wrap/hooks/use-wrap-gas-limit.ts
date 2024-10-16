import { useLidoSWR } from '@lido-sdk/react';

import { config } from 'config';
import {
  WRAP_FROM_ETH_GAS_LIMIT,
  WRAP_GAS_LIMIT,
  WRAP_L2_GAS_LIMIT,
} from 'consts/tx';
import {
  applyGasLimitRatio,
  applyGasLimitRatioBigInt,
} from 'utils/apply-gas-limit-ratio';
import { useDappStatus, useLidoSDK } from 'modules/web3';

import { ESTIMATE_ACCOUNT, ESTIMATE_AMOUNT } from 'config/groups/web3';
import { BigNumber } from 'ethers';
import { Zero } from '@ethersproject/constants';

export const useWrapGasLimit = () => {
  const { isDappActiveOnL2 } = useDappStatus();
  const { l2, isL2, wrap, core } = useLidoSDK();

  const wrapFallback = isDappActiveOnL2 ? WRAP_L2_GAS_LIMIT : WRAP_GAS_LIMIT;

  const { data } = useLidoSWR(
    ['[swr:wrap-gas-limit]', core.chainId, isL2],
    async (_key: string) => {
      const fetchGasLimitETH = async () => {
        if (isL2) return Zero;
        try {
          return BigNumber.from(
            applyGasLimitRatioBigInt(
              await wrap.wrapEthEstimateGas({
                value: ESTIMATE_AMOUNT.toBigInt(),
                account: ESTIMATE_ACCOUNT,
              }),
            ),
          );
        } catch (error) {
          console.warn(`${_key}::[eth]`, error);
          return applyGasLimitRatio(WRAP_FROM_ETH_GAS_LIMIT);
        }
      };

      const fetchGasLimitStETH = async () => {
        try {
          if (isL2) {
            // L2 unwrap steth to wsteth
            const contract = await l2.getContract();
            return BigNumber.from(
              await contract.estimateGas.unwrap([ESTIMATE_AMOUNT.toBigInt()], {
                account: ESTIMATE_ACCOUNT,
              }),
            );
          } else {
            // L1 wrap steth to wsteth
            const contract = await wrap.getContractWstETH();
            return BigNumber.from(
              await contract.estimateGas.wrap(
                [config.ESTIMATE_AMOUNT.toBigInt()],
                {
                  account: config.ESTIMATE_ACCOUNT,
                },
              ),
            );
          }
        } catch (error) {
          console.warn(`${_key}::[steth]`, error);
          return wrapFallback;
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
    gasLimitStETH: data?.gasLimitStETH || wrapFallback,
  };
};
