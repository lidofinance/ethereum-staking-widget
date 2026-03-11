import type { Resolver } from 'react-hook-form';
import { formatUnits, maxUint256 } from 'viem';
import invariant from 'tiny-invariant';

import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';
import { validateBigintMin } from 'shared/hook-form/validation/validate-bigint-min';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';
import { ValidationError } from 'shared/hook-form/validation/validation-error';
import { awaitWithTimeout } from 'utils/await-with-timeout';
import { USD_VAULT_TOKEN_SYMBOL } from '../../consts';
import type {
  UsdVaultWithdrawFormValidationContext,
  UsdVaultWithdrawFormValues,
} from './types';

const validateUsdAmount: (
  field: string,
  amount: bigint | undefined | null,
  token: string,
) => asserts amount is bigint = (field, amount, token) => {
  if (amount == null) throw new ValidationError(field, '');

  if (amount <= 0n)
    throw new ValidationError(field, `Enter ${token} ${field} greater than 0`);

  if (amount > maxUint256)
    throw new ValidationError(field, `${token} ${field} is not valid`);
};

const messageMaxBalance = (max: bigint, token: string) =>
  `Entered ${token} amount exceeds your available balance of ${formatUnits(max, 18)}`;

export const UsdVaultWithdrawFormValidationResolver: Resolver<
  UsdVaultWithdrawFormValues,
  UsdVaultWithdrawFormValidationContext
> = async (values, context) => {
  const { amount } = values;
  const token = USD_VAULT_TOKEN_SYMBOL;
  try {
    invariant(context, 'must have context promise');

    // this check does not require async context and can be placed first
    // also limits async context missing edge cases on page start
    validateUsdAmount('amount', amount, token);

    // early return
    if (!context.isWalletActive) return { values, errors: {} };

    // wait for context promise with timeout and extract relevant data
    // validation function only waits limited time for data and fails validation otherwise
    // most of the time data will already be available
    const awaitedContext = await awaitWithTimeout(
      context.asyncContext,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    // prevents problems with conversion
    validateBigintMin('amount', amount, 100n, `Amount too small`);

    const { balance } = awaitedContext[token];

    validateBigintMax(
      'amount',
      amount,
      balance,
      messageMaxBalance(balance, 'earnUSD'),
    );

    return {
      values: { ...values },
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'USDWithdrawForm', 'amount');
  }
};
