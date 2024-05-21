import { BigNumber } from 'ethers';
import { parseEther } from '@ethersproject/units';

import { StakeSwapDiscountIntegrationKey } from 'features/stake/swap-discount-banner';

import { IPFS_REFERRAL_ADDRESS } from './ipfs';

// Don't use here:
// import { config } from '../get-config';
// otherwise you will get something like a cyclic error!
import { preConfig } from '../get-preconfig';
import { AddressZero } from '@ethersproject/constants';

export const PRECISION = 10 ** 6;

// how much to leave out on user balance when max is pressed
export const BALANCE_PADDING = parseEther('0.01');

export const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

export const STETH_SUBMIT_GAS_LIMIT_DEFAULT = 90000;

export const STAKE_GASLIMIT_FALLBACK = BigNumber.from(
  Math.floor(
    STETH_SUBMIT_GAS_LIMIT_DEFAULT * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
  ),
);

export const STAKE_FALLBACK_REFERRAL_ADDRESS = preConfig.ipfsMode
  ? IPFS_REFERRAL_ADDRESS
  : AddressZero;

export const STAKE_SWAP_INTEGRATION: StakeSwapDiscountIntegrationKey =
  'one-inch';
