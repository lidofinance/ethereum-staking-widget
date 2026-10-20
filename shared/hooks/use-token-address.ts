import invariant from 'tiny-invariant';
import type { Address } from 'viem';
import {
  CHAINS,
  CONTRACTS_BY_TOKENS,
  LIDO_L2_CONTRACT_ADDRESSES,
  LIDO_L2_CONTRACT_NAMES,
} from '@lidofinance/lido-ethereum-sdk/common';
import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import { useQuery } from '@tanstack/react-query';

import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { useDappStatus, useLidoSDK } from 'modules/web3';
import { isSupportedL2Chain } from 'consts/chains';

const fetchTokenAddress = async (
  token: string,
  core: LidoSDKCore,
  chainId: CHAINS,
): Promise<Address> => {
  if (isSupportedL2Chain(chainId as any)) {
    const address =
      LIDO_L2_CONTRACT_ADDRESSES[chainId]?.[
        token.toLowerCase() as LIDO_L2_CONTRACT_NAMES
      ];
    invariant(address, `Do not have address for ${token} on ${chainId}`);
    return address;
  } else {
    invariant(
      core.chainId === chainId,
      `Core chainId ${core.chainId} does not match expected chainId ${chainId}`,
    );
    const address = await core.getContractAddress(
      CONTRACTS_BY_TOKENS[token as keyof typeof CONTRACTS_BY_TOKENS],
    );
    invariant(address, `Do not have address for ${token} on ${core.chainId}`);
    return address;
  }
};

export const useTokenAddress = (
  token: string,
  chainIdOverride?: CHAINS,
): Address | undefined => {
  const { chainId } = useDappStatus();
  const effectiveChainId = chainIdOverride ?? chainId;
  const { core } = useLidoSDK();

  const { data: address } = useQuery({
    queryKey: [
      'token-address',
      { token, coreChaindId: core.chainId, effectiveChainId },
    ],
    enabled: !!token,
    ...STRATEGY_IMMUTABLE,
    queryFn: () => fetchTokenAddress(token, core, effectiveChainId),
  });

  return address;
};
