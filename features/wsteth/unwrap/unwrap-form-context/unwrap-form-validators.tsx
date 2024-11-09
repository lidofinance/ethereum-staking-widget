import invariant from 'tiny-invariant';
import { formatEther } from '@ethersproject/units';
import type { Resolver } from 'react-hook-form';

import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';

import { awaitWithTimeout } from 'utils/await-with-timeout';
import { TOKENS } from '@lido-sdk/constants';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import type { UnwrapFormInputType, UnwrapFormValidationContext } from './types';

const messageMaxAmount = (max: bigint) =>
  `Entered ${getTokenDisplayName(
    TOKENS.WSTETH,
  )} amount exceeds your available balance of ${formatEther(max)}`;

export const UnwrapFormValidationResolver: Resolver<
  UnwrapFormInputType,
  Promise<UnwrapFormValidationContext>
> = async (values, validationContextPromise) => {
  const { amount } = values;
  try {
    invariant(
      validationContextPromise,
      'validation context must be presented as context promise',
    );

    // TODO: NEW SDK
    validateEtherAmount('amount', amount ? amount : undefined, TOKENS.WSTETH);

    const { isWalletActive: active, maxAmount } = await awaitWithTimeout(
      validationContextPromise,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    if (active) {
      invariant(maxAmount, 'maxAmount must be presented');

      validateBigintMax(
        'amount',
        // TODO: NEW SDK
        amount ? amount : BigInt(0),
        maxAmount,
        messageMaxAmount(maxAmount),
      );
    } else {
      return {
        values,
        errors: { dummyErrorField: 'wallet is not connected' },
      };
    }
    return {
      values,
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(
      error,
      'UnwrapForm',
      'dummyErrorField',
    );
  }
};
