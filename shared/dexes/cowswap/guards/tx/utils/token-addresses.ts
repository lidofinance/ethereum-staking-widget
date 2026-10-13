import { type Address } from 'viem';
import invariant from 'tiny-invariant';

import { getTokenAddress } from 'config/networks/token-address';

import { type ContactsMap } from './types';

export const collectTokenAddresses = (
  contracts: ContactsMap,
  dexTokenKeys: readonly (keyof ContactsMap)[],
): Set<Address> => {
  const addresses = new Set<Address>();
  for (const key of dexTokenKeys) {
    const addr = contracts[key];

    if (addr) addresses.add(addr.toLowerCase() as Address);
  }

  return addresses;
};

export const collectSellTokenAddresses = (
  contracts: ContactsMap,
  sellTokenKeys: readonly (keyof ContactsMap)[],
): Set<Address> => {
  const addresses = new Set<Address>();
  for (const key of sellTokenKeys) {
    const addr = contracts[key];

    if (addr) addresses.add(addr.toLowerCase() as Address);
  }

  return addresses;
};

export const collectBuyTokenAddresses = (
  contracts: ContactsMap,
  buyTokenKeys: readonly (keyof ContactsMap)[],
): Set<Address> => {
  const addresses = new Set<Address>();
  for (const key of buyTokenKeys) {
    const addr = contracts[key];

    if (addr) addresses.add(addr.toLowerCase() as Address);
  }

  const ethAddress = getTokenAddress(1, 'eth');
  invariant(ethAddress, 'eth address is undefined');

  // 0xeeee...
  addresses.add(ethAddress.toLowerCase() as Address);

  return addresses;
};
