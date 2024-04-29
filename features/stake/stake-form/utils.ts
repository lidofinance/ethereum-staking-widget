import { BigNumber } from 'ethers';
import { hexlify, isAddress } from 'ethers/lib/utils';
import type { BaseProvider } from '@ethersproject/providers';

import { config } from 'config';

export const applyGasLimitRatio = (gasLimit: BigNumber): BigNumber =>
  gasLimit
    .mul(config.SUBMIT_EXTRA_GAS_TRANSACTION_RATIO * config.PRECISION)
    .div(config.PRECISION);

const ADDRESS_MODULO = BigNumber.from(2).pow(160);
const applyReferralShift = (address: string) => {
  return hexlify(
    BigNumber.from(address)
      .add(config.STAKE_REFERRAL_OFFSET)
      .mod(ADDRESS_MODULO),
  );
};

export const getAddress = async (
  input: string,
  providerRpc: BaseProvider,
): Promise<string> => {
  let address;
  try {
    // extract address from url or from ens
    if (isAddress(input)) {
      address = input;
    } else {
      const resolved = await providerRpc.resolveName(input);
      if (resolved) address = resolved;
    }
    // apply tracking shift
    if (address) {
      return applyReferralShift(address);
    }
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
