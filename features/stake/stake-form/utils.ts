import { isAddress } from 'ethers/lib/utils';
import type { BaseProvider } from '@ethersproject/providers';

export const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

export const getAddress = async (
  input: string,
  providerRpc: BaseProvider,
): Promise<string> => {
  try {
    if (isAddress(input)) return input;
    const address = await providerRpc.resolveName(input);
    if (address) return address;
  } catch {
    // noop
  }
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
