import type { Resolver } from 'react-hook-form';
import { formatEther } from 'viem';
import invariant from 'tiny-invariant';
import type {
  STGWithdrawFormValidationContext,
  STGWithdrawFormValues,
} from './types';

import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';

import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';
import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { validateBigintMin } from 'shared/hook-form/validation/validate-bigint-min';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';

import { awaitWithTimeout } from 'utils/await-with-timeout';

const messageMaxBalance = (max: bigint, token: string) =>
  `Entered ${token} amount exceeds your available balance of ${formatEther(max)}`;

export const STGWithdrawFormValidationResolver: Resolver<
  STGWithdrawFormValues,
  STGWithdrawFormValidationContext
> = async (values, context) => {
  const { amount, token } = values;
  try {
    invariant(context, 'must have context promise');

    // this check does not require async context and can be placed first
    // also limits async context missing edge cases on page start
    validateEtherAmount('amount', amount, token);

    // early return
    if (!context.isWalletActive) return { values, errors: {} };

    // wait for context promise with timeout and extract relevant data
    // validation function only waits limited time for data and fails validation otherwise
    // most of the time data will already be available
    const awaitedContext = await awaitWithTimeout(
      context.asyncContext,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    // prevents problems with strETH conversion
    validateBigintMin(
      'amount',
      amount,
      100n,
      `Enter amount larger than 100 wei`,
    );

    const { balance } = awaitedContext[token];

    validateBigintMax(
      'amount',
      amount,
      balance,
      messageMaxBalance(balance, 'strETH'),
    );

    return {
      values: { ...values },
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'STGWithdrawForm', 'token');
  }
};
