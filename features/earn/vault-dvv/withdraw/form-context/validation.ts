import { formatEther } from 'viem';
import type { Resolver } from 'react-hook-form';
import invariant from 'tiny-invariant';

import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';
import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import { awaitWithTimeout } from 'utils/await-with-timeout';
import { validateBigintMin } from 'shared/hook-form/validation/validate-bigint-min';
import {
  getTokenDisplayName,
  TOKEN_DISPLAY_NAMES,
} from 'utils/getTokenDisplayName';
import {
  DVVWithdrawalFormValidationContext,
  DVVWithdrawalFormValues,
} from '../types';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';

const messageMaxBalance = (max: bigint, token: TOKEN_DISPLAY_NAMES) =>
  `Entered ${getTokenDisplayName(
    token,
  )} amount exceeds your available balance of ${formatEther(max)}`;

export const DVVWithdrawalFormValidationResolver: Resolver<
  DVVWithdrawalFormValues,
  DVVWithdrawalFormValidationContext
> = async (values, context) => {
  const { amount } = values;
  try {
    invariant(context, 'must have context promise');

    // this check does not require async context and can be placed first
    // also limits async context missing edge cases on page start
    validateEtherAmount('amount', amount, 'dvstETH');

    // early return
    if (!context.isWalletActive) return { values, errors: {} };

    // wait for context promise with timeout and extract relevant data
    // validation function only waits limited time for data and fails validation otherwise
    // most of the time data will already be available
    const { balance } = await awaitWithTimeout(
      context.asyncContext,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    // 100 wei as withdrawal minimum to avoid share conversion issues
    const minWithdrawal = 100n;

    validateBigintMin(
      'amount',
      amount,
      minWithdrawal,
      `Enter amount larger than ${formatEther(minWithdrawal)}`,
    );

    validateBigintMax(
      'amount',
      amount,
      balance,
      messageMaxBalance(balance, 'dvstETH'),
    );

    return {
      values: { ...values },
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'DVVWithdrawalForm', 'amount');
  }
};
