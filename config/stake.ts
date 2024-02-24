import { BigNumber } from 'ethers';
import { parseEther } from '@ethersproject/units';
import { AddressZero } from '@ethersproject/constants';

import { getOneConfig } from './one-config/utils';
const { ipfsMode } = getOneConfig();

import { IPFS_REFERRAL_ADDRESS } from './ipfs';

// TODO: const
export const PRECISION = 10 ** 6;

// TODO: const
// how much to leave out on user balance when max is pressed
export const BALANCE_PADDING = parseEther('0.01');

// TODO: const
export const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

// TODO: const
export const STETH_SUBMIT_GAS_LIMIT_DEFAULT = 90000;

// TODO: const
export const STAKE_GASLIMIT_FALLBACK = BigNumber.from(
  Math.floor(
    STETH_SUBMIT_GAS_LIMIT_DEFAULT * SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
  ),
);

// TODO: move to OneConfig
export const STAKE_FALLBACK_REFERRAL_ADDRESS = ipfsMode
  ? IPFS_REFERRAL_ADDRESS
  : AddressZero;
