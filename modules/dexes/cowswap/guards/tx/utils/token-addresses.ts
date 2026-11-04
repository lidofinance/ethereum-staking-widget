import { ethAddress, type Address } from 'viem';

import type { CowswapNetwork, DexTokenKey } from './types';

// 'eth' is the native ETH placeholder (0xeeee...), same on every chain
export const resolveTokenAddress = (
  contracts: CowswapNetwork,
  key: DexTokenKey,
): Address | undefined => {
  if (key === 'eth') return ethAddress;

  const addr = contracts[key];

  return addr ? (addr.toLowerCase() as Address) : undefined;
};

export const collectTokenAddresses = (
  contracts: CowswapNetwork,
  keys: readonly DexTokenKey[],
): Set<Address> => {
  const addresses = new Set<Address>();
  for (const key of keys) {
    const addr = resolveTokenAddress(contracts, key);

    if (addr) addresses.add(addr);
  }

  return addresses;
};
