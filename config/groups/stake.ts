import { StakeSwapDiscountIntegrationKey } from 'features/stake/swap-discount-banner';

import { IPFS_REFERRAL_ADDRESS } from './ipfs';

// Don't use here:
// import { config } from '../get-config';
// otherwise you will get something like a cyclic error!
import { preConfig } from '../get-preconfig';

export const PRECISION = 10 ** 6;

export const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

export const STETH_SUBMIT_GAS_LIMIT_DEFAULT = 90000;

export const STAKE_GASLIMIT_FALLBACK = BigInt(
  Math.floor(
    STETH_SUBMIT_GAS_LIMIT_DEFAULT * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
  ),
);

export const LIDO_ADDRESS = '0x11D00000000000000000000000000000000011D0';

export const STAKE_FALLBACK_REFERRAL_ADDRESS = preConfig.ipfsMode
  ? IPFS_REFERRAL_ADDRESS
  : LIDO_ADDRESS;

export const STAKE_SWAP_INTEGRATION: StakeSwapDiscountIntegrationKey =
  'one-inch';
