import { PublicClient, isAddress } from 'viem';
import { getEnsAddress } from 'viem/ens';
import { isAddress as isAddress_Ethers } from 'ethers/lib/utils';
import type { BaseProvider } from '@ethersproject/providers';

// TODO: NEW SDK (rename getAddressViem -> getAddress)
export const getAddressViem = async (
  input: string,
  provider: PublicClient,
): Promise<string> => {
  try {
    if (isAddress(input)) return input;
    // TODO: NEW SDK (check the provider type matching)
    const address = await getEnsAddress(provider, { name: input });
    if (address) return address.toString();
    return input;
  } catch {
    // noop
  }

  // if code gets here, ref is invalid and we need to throw error
  throw new ReferralAddressError();
};

// TODO: NEW SDK (remove)
// DEPRECATED
export const getAddress = async (
  input: string,
  providerRpc: BaseProvider,
): Promise<string> => {
  try {
    if (isAddress_Ethers(input)) return input;
    const address = await providerRpc.resolveName(input);
    if (address) return address;
  } catch {
    // noop
  }
  // if code gets here, ref is invalid and we need to throw error
  throw new ReferralAddressError();
};

export class ReferralAddressError extends Error {
  reason: string;
  constructor() {
    const message = 'execution reverted: INVALID_REFERRAL';
    super(message);
    this.reason = message;
  }
}

export class MockLimitReachedError extends Error {
  reason: string;
  constructor(message: string) {
    super(message);
    this.reason = 'execution reverted: STAKE_LIMIT';
  }
}
