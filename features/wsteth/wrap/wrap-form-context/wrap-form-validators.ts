import invariant from 'tiny-invariant';
import { formatEther } from 'viem';
import type { Resolver } from 'react-hook-form';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';

import { validateStakeEth } from 'shared/hook-form/validation/validate-stake-eth';
import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';
import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { awaitWithTimeout } from 'utils/await-with-timeout';

import type { WrapFormInputType, WrapFormValidationContext } from './types';

const messageMaxAmount = (max: bigint, token: TOKENS_TO_WRAP) =>
  `Entered ${getTokenDisplayName(
    token,
  )} amount exceeds your available balance of ${formatEther(max)}`;

export const WrapFormValidationResolver: Resolver<
  WrapFormInputType,
  WrapFormValidationContext
> = async (values, validationContext) => {
  const { amount, token } = values;
  try {
    invariant(validationContext, 'validation context must be present');
    const { asyncContext } = validationContext;

    validateEtherAmount('amount', amount, token);

    const awaitedContext = await awaitWithTimeout(
      asyncContext,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    if (token === TOKENS_TO_WRAP.ETH) {
      // checks active internally after other wallet-less check
      validateStakeEth({
        formField: 'amount',
        amount,
        ...awaitedContext,
        gasCost: awaitedContext.gasCost,
      });
    } else if (awaitedContext.isWalletActive) {
      validateBigintMax(
        'amount',
        amount,
        awaitedContext.stethBalance,
        messageMaxAmount(awaitedContext.stethBalance, token),
      );
    } else {
      return {
        values,
        errors: { token: 'wallet is not connected' },
      };
    }

    return {
      values,
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'WrapForm', 'token');
  }
};
