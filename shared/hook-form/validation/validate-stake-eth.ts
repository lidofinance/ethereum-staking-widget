import { formatEther } from 'viem';

import type { LIMIT_LEVEL } from 'types';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';

import { validateStakeLimit } from './validate-stake-limit';

export type validateStakeEthParams = {
  formField: string;
  amount: bigint;
  stakingLimitLevel: LIMIT_LEVEL;
  currentStakeLimit: bigint;
  gasCost: bigint;
} & (
  | { isWalletActive: true; etherBalance: bigint; isMultisig: boolean }
  | { isWalletActive: false }
);

// Runs validation pipeline common between stake and wrapEth
export const validateStakeEth = (params: validateStakeEthParams) => {
  validateStakeLimit('amount', params.stakingLimitLevel);

  if (params.isWalletActive) {
    const {
      amount,
      formField,
      currentStakeLimit,
      gasCost,

      etherBalance,
      isMultisig,
    } = params;
    validateBigintMax(
      formField,
      amount,
      etherBalance,
      `Entered ETH amount exceeds your available balance of ${formatEther(
        etherBalance,
      )}`,
    );

    validateBigintMax(
      formField,
      amount,
      currentStakeLimit,
      `Entered ETH amount exceeds current staking limit of ${formatEther(
        currentStakeLimit,
      )}`,
    );

    if (!isMultisig) {
      const gasPaddedBalance = etherBalance - gasCost;

      validateBigintMax(
        formField,
        0n,
        gasPaddedBalance,
        `Ensure you have sufficient ETH to cover the gas cost of ${formatEther(
          gasCost,
        )}`,
      );

      validateBigintMax(
        formField,
        amount,
        gasPaddedBalance,
        `Enter ETH amount less than ${formatEther(
          gasPaddedBalance,
        )} to ensure you leave enough ETH for gas fees`,
      );
    }
  }
};
