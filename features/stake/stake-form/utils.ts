import { PublicClient, isAddress } from 'viem';
import { getEnsAddress } from 'viem/ens';

export const getAddress = async (
  input: string,
  provider: PublicClient,
): Promise<string> => {
  try {
    if (isAddress(input)) return input;
    const address = await getEnsAddress(provider, { name: input });
    if (address) return address.toString();
    return input;
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
