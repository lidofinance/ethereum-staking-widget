import useSWR from 'swr';
import invariant from 'tiny-invariant';
import type { Address } from 'viem';

import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';

import { useLidoSDK } from 'modules/web3';
import {
  CHAINS,
  CONTRACTS_BY_TOKENS,
  LIDO_L2_CONTRACT_ADDRESSES,
  LIDO_L2_CONTRACT_NAMES,
} from '@lidofinance/lido-ethereum-sdk/common';

const fetchTokenAddress = async (
  token: string,
  core: LidoSDKCore,
  isL2: boolean,
): Promise<Address> => {
  if (isL2) {
    const address =
      LIDO_L2_CONTRACT_ADDRESSES[core.chainId as CHAINS]?.[
        token as LIDO_L2_CONTRACT_NAMES
      ];
    invariant(address, `Do not have address for ${token} on ${core.chainId}`);
    return address;
  } else {
    const address = await core.getContractAddress(
      CONTRACTS_BY_TOKENS[token as keyof typeof CONTRACTS_BY_TOKENS],
    );
    invariant(address, `Do not have address for ${token} on ${core.chainId}`);
    return address;
  }
};

export const useTokenAddress = (
  token: string,
): Address | `0x${string}` | undefined => {
  const { core, isL2 } = useLidoSDK();
  // TODO: NEW SDK (migrate to react query)
  const { data: address } = useSWR(
    token ? ['tokenAddress', token, core, isL2] : null,
    () => fetchTokenAddress(token, core, isL2),
  );

  return address;
};
