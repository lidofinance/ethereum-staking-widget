import { formatEther } from 'viem';

import type { LIMIT_LEVEL } from 'types';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';

import { validateStakeLimit } from './validate-stake-limit';

export type validateStakeWethParams = {
  formField: string;
  amount: bigint;
  stakingLimitLevel?: LIMIT_LEVEL;
  currentStakeLimit?: bigint;
  // unwrap + submit, paid in ETH
  gasCost: bigint;
} & (
  | {
      isWalletActive: true;
      wethBalance: bigint;
      etherBalance: bigint;
      isSmartAccount: boolean;
    }
  | { isWalletActive: false }
);

// WETH is unwrapped to ETH and submitted, so the stake limit applies as for ETH.
// The amount comes from the WETH balance while gas still comes from the ETH balance.
export const validateStakeWeth = (params: validateStakeWethParams) => {
  params.stakingLimitLevel &&
    validateStakeLimit('amount', params.stakingLimitLevel);

  if (!params.isWalletActive) return;

  const {
    amount,
    formField,
    currentStakeLimit,
    gasCost,
    wethBalance,
    etherBalance,
    isSmartAccount,
  } = params;

  currentStakeLimit !== undefined &&
    validateBigintMax(
      formField,
      amount,
      currentStakeLimit,
      `Entered WETH amount exceeds current staking limit of ${formatEther(
        currentStakeLimit,
      )}`,
    );

  validateBigintMax(
    formField,
    amount,
    wethBalance,
    `Entered WETH amount exceeds your available balance of ${formatEther(
      wethBalance,
    )}`,
  );

  // allow Smart Account(AA) to have zero ETH balance as they can be sponsored
  if (!isSmartAccount) {
    validateBigintMax(
      formField,
      gasCost,
      etherBalance,
      `Ensure you have sufficient ETH to cover the gas cost of ${formatEther(
        gasCost,
      )}`,
    );
  }
};
