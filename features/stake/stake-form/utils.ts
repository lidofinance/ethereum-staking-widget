import type { PopulatedTransaction } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import type { BaseProvider } from '@ethersproject/providers';

import { config } from 'config';
import invariant from 'tiny-invariant';

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
  // if code gets here, ref is invalid and we need to throw error
  throw new ReferralAddressError();
};

// adds metrics indicator for widget tx
export const applyCalldataSuffix = (tx: PopulatedTransaction) => {
  if (!config.ipfsMode) {
    invariant(tx.data, 'transaction must have calldata');
    tx.data = tx.data + config.STAKE_WIDGET_METRIC_SUFFIX;
  }
  return tx;
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
