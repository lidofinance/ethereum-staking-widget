import { PublicClient, isAddress } from 'viem';
import { getEnsAddress, normalize } from 'viem/ens';
import { config } from 'config';

export const getRefferalAddress = async (
  input: string | null,
  provider: PublicClient,
): Promise<string> => {
  try {
    const fallback = config.STAKE_FALLBACK_REFERRAL_ADDRESS;

    if (input) {
      // The address is Ethereum address
      if (isAddress(input)) return input;

      // Not all ENS names end with .eth, so we can't detect ENS names easily.
      // The address is a http[s] link, return fallback instead
      if (/^https?:\/\//.test(input)) return fallback;
      // Filter out *.lido.fi referrals, e.g. ref from blog.lido.fi
      // Assuming, that no one uses the 'lido.fi' ENS name
      if (input.endsWith('lido.fi')) return fallback;

      // Trying to get ENS address takes some time, so it is called after another checks
      const ensAddress = await getEnsAddress(provider, {
        name: normalize(input),
      });
      if (ensAddress) return ensAddress.toString();
    }

    // the provided 'input' is not an Ethereum address, nor a ENS address, returning the fallback
    return fallback;
  } catch {
    // something went wrong during getting the address
    throw new ReferralAddressError();
  }
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
