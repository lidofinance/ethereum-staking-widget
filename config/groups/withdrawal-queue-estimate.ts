import { BigNumber } from 'ethers';

// fallback gas limits per 1 withdraw request
export const WITHDRAWAL_QUEUE_REQUEST_STETH_PERMIT_GAS_LIMIT_DEFAULT =
  BigNumber.from(255350);
export const WITHDRAWAL_QUEUE_REQUEST_WSTETH_PERMIT_GAS_LIMIT_DEFAULT =
  BigNumber.from(312626);

export const WITHDRAWAL_QUEUE_REQUEST_STETH_APPROVED_GAS_LIMIT_DEFAULT =
  BigNumber.from(228163);
export const WITHDRAWAL_QUEUE_REQUEST_WSTETH_APPROVED_GAS_LIMIT_DEFAULT =
  BigNumber.from(280096);

export const WITHDRAWAL_QUEUE_CLAIM_GAS_LIMIT_DEFAULT = BigNumber.from(89818);
