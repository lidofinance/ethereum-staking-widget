import invariant from 'tiny-invariant';
import { formatEther } from '@ethersproject/units';
import type { BigNumber } from 'ethers';
import type { Resolver } from 'react-hook-form';

import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { validateBignumberMax } from 'shared/hook-form/validation/validate-bignumber-max';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';

import { awaitWithTimeout } from 'utils/await-with-timeout';
import { TOKENS } from '@lido-sdk/constants';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import type { UnwrapFormInputType, UnwrapFormValidationContext } from './types';

const messageMaxAmount = (max: BigNumber) =>
  `${getTokenDisplayName(
    TOKENS.WSTETH,
  )} amount must not be greater than ${formatEther(max)}`;

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

    validateEtherAmount('amount', amount, TOKENS.WSTETH);

    const { active, maxAmount } = await awaitWithTimeout(
      validationContextPromise,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    if (active) {
      invariant(maxAmount, 'maxAmount must be presented');

      validateBignumberMax(
        'amount',
        amount,
        maxAmount,
        messageMaxAmount(maxAmount),
      );
    }

    return {
      values,
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'UnwrapForm', 'amount');
  }
};
