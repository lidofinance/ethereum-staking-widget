import type { Resolver } from 'react-hook-form';
import { formatEther } from 'viem';
import invariant from 'tiny-invariant';
import type {
  GGVDepositFormValidationContext,
  GGVDepositFormValues,
} from './types';

import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';

import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';
import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { validateBigintMin } from 'shared/hook-form/validation/validate-bigint-min';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';

import { awaitWithTimeout } from 'utils/await-with-timeout';
import {
  TOKEN_DISPLAY_NAMES,
  getTokenDisplayName,
} from 'utils/getTokenDisplayName';

const messageMaxBalance = (max: bigint, token: TOKEN_DISPLAY_NAMES) =>
  `Entered ${getTokenDisplayName(
    token,
  )} amount exceeds your available balance of ${formatEther(max)}`;

const messageMaxCapacity = (max: bigint, token: TOKEN_DISPLAY_NAMES) =>
  `Entered ${getTokenDisplayName(
    token,
  )} amount exceeds available vault capacity of ${formatEther(max)}`;

export const GGVDepositFormValidationResolver: Resolver<
  GGVDepositFormValues,
  GGVDepositFormValidationContext
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

    // prevents problems with eth/stETH/wstETH onchain conversion
    validateBigintMin(
      'amount',
      amount,
      100n,
      `Enter amount larger than 100 wei`,
    );

    const { balance, maxDeposit } = awaitedContext[token];

    validateBigintMax(
      'amount',
      amount,
      balance,
      messageMaxBalance(balance, token),
    );

    maxDeposit &&
      validateBigintMax(
        'amount',
        amount,
        maxDeposit,
        messageMaxCapacity(maxDeposit, token),
      );

    return {
      values: { ...values },
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'GGVDepositForm', 'token');
  }
};
