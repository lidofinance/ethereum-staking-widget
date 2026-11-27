import { WstethABI } from '@lidofinance/lido-ethereum-sdk/wrap';
import type { Config } from 'wagmi';

import { TOKENS } from 'consts/tokens';

import { getClient, getTokenAddressOrThrow } from '../../../../../utils';

/**
 * wstETH for `steth` on an L1, by the contract's own conversion (shares
 * math, its rounding included): what wrapping that stETH mints. The SDK's
 * convertStethToWsteth calls the same function, on the wallet's chain only.
 */
export const readWstethBySteth = (
  wagmiConfig: Config,
  chainId: number,
  steth: bigint,
) =>
  getClient(wagmiConfig, chainId).readContract({
    address: getTokenAddressOrThrow(chainId, TOKENS.wsteth),
    abi: WstethABI,
    functionName: 'getWstETHByStETH',
    args: [steth],
  });
