import { useLidoSDK } from 'providers/lido-sdk';
import { isSDKSupportedL2Chain } from 'consts/chains';
import {
  CHAINS,
  LIDO_L2_CONTRACT_ADDRESSES,
  LIDO_L2_CONTRACT_NAMES,
} from '@lidofinance/lido-ethereum-sdk';
import invariant from 'tiny-invariant';
import {
  CHAINS as OLD_CHAINS,
  TOKENS,
  getTokenAddress,
} from '@lido-sdk/constants';

import type { Address } from 'viem';

// TODO rework this and sdk to get all addresses sync way
export const useTokenAddress = (token: string): Address => {
  const { core } = useLidoSDK();
  const tokenName = token.toLocaleLowerCase();
  if (isSDKSupportedL2Chain(core.chainId as any)) {
    const address =
      LIDO_L2_CONTRACT_ADDRESSES[core.chainId as CHAINS]?.[
        tokenName as LIDO_L2_CONTRACT_NAMES
      ];
    invariant(address, `Do not have address for ${token} on ${core.chainId}`);
    return address;
  }
  return getTokenAddress(
    core.chainId as unknown as OLD_CHAINS,
    token.toLocaleUpperCase() as TOKENS,
  ) as Address;
};
