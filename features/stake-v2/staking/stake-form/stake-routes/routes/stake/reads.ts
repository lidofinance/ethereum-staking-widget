import type { QueryClient } from '@tanstack/react-query';
import { encodeFunctionData, zeroAddress } from 'viem';
import { StethAbi } from '@lidofinance/lido-ethereum-sdk/stake';
import type { Config } from 'wagmi';

import { config } from 'config';
import { TOKENS } from 'consts/tokens';
import { ESTIMATE_AMOUNT } from 'modules/web3';

import {
  cachedRead,
  getClient,
  getTokenAddressOrThrow,
} from '../../../../../utils';

/**
 * Gas of Lido submit() on `chainId`, estimated once from the estimate
 * account; the fallback when the estimate fails.
 */
export const readSubmitGasLimit = (
  queryClient: QueryClient,
  wagmiConfig: Config,
  chainId: number,
) =>
  cachedRead(
    queryClient,
    ['stake-v2', 'submit-gas-limit', { chainId }],
    () =>
      getClient(wagmiConfig, chainId)
        .estimateGas({
          account: config.ESTIMATE_ACCOUNT,
          to: getTokenAddressOrThrow(chainId, TOKENS.steth),
          data: encodeFunctionData({
            abi: StethAbi,
            functionName: 'submit',
            args: [zeroAddress],
          }),
          value: ESTIMATE_AMOUNT,
        })
        .catch((error: unknown) => {
          console.warn('[stake-v2] submit gas estimate failed', error);
          return config.STAKE_GASLIMIT_FALLBACK;
        }),
    Infinity,
  );
