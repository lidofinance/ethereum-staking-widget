import { validateBignumberMax } from './validate-bignumber-max';
import { validateStakeLimit } from './validate-stake-limit';
import { formatEther } from '@ethersproject/units';
import { Zero } from '@ethersproject/constants';

import type { LIMIT_LEVEL } from 'types';
import type { BigNumber } from 'ethers';

export type validateStakeEthParams = {
  formField: string;
  amount: BigNumber;
  stakingLimitLevel: LIMIT_LEVEL;
  currentStakeLimit: BigNumber;
  gasCost: BigNumber;
} & (
  | { isWalletActive: true; etherBalance: BigNumber; isMultisig: boolean }
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
    validateBignumberMax(
      formField,
      amount,
      etherBalance,
      `Entered ETH amount exceeds your available balance of ${formatEther(
        etherBalance,
      )}`,
    );

    validateBignumberMax(
      formField,
      amount,
      currentStakeLimit,
      `Entered ETH amount exceeds current staking limit of ${formatEther(
        currentStakeLimit,
      )}`,
    );

    if (!isMultisig) {
      const gasPaddedBalance = etherBalance.sub(gasCost);

      validateBignumberMax(
        formField,
        Zero,
        gasPaddedBalance,
        `Ensure you have sufficient ETH to cover the gas cost of ${formatEther(
          gasCost,
        )}`,
      );

      validateBignumberMax(
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
