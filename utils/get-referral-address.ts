import { Address, PublicClient, isAddress } from 'viem';
import { getEnsAddress, normalize } from 'viem/ens';

export const getReferralAddress = async (
  input: string | null,
  provider: PublicClient,
  fallbackAddress: Address,
): Promise<string> => {
  try {
    if (!input) return fallbackAddress;

    // The address is Ethereum address
    if (isAddress(input)) return input;

    // Not all ENS names end with .eth, so we can't detect ENS names easily.
    // The address is a http[s] link, return fallback instead
    if (/^https?:\/\//.test(input)) return fallbackAddress;
    // Filter out *.lido.fi referrals, e.g. ref from blog.lido.fi
    // Assuming, that no one uses the 'lido.fi' ENS name
    if (input.endsWith('lido.fi')) return fallbackAddress;

    // Trying to get ENS address takes some time, so it is called after another checks
    const ensAddress = await getEnsAddress(provider, {
      name: normalize(input),
    });
    if (ensAddress) return ensAddress.toString();

    // the provided 'input' is not an Ethereum address, nor a ENS address, returning the fallback
    return fallbackAddress;
  } catch {
    // something went wrong during getting the address
    throw new ReferralAddressError();
  }
};

class ReferralAddressError extends Error {
  reason: string;
  constructor() {
    const message = 'execution reverted: INVALID_REFERRAL';
    super(message);
    this.reason = message;
  }
}
