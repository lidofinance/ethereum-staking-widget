import invariant from 'tiny-invariant';
import { formatEther } from '@ethersproject/units';
import type { BigNumber } from 'ethers';
import type { Resolver } from 'react-hook-form';

import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { validateBignumberMax } from 'shared/hook-form/validation/validate-bignumber-max';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';

import { awaitWithTimeout } from 'utils/await-with-timeout';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import type { WrapFormInputType, WrapFormValidationContext } from './types';
import { TokensWrappable, TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { validateStakeLimit } from 'shared/hook-form/validation/validate-stake-limit';

const messageMaxAmount = (max: BigNumber, token: TokensWrappable) =>
  `${getTokenDisplayName(token)} amount must not be greater than ${formatEther(
    max,
  )}`;

export const WrapFormValidationResolver: Resolver<
  WrapFormInputType,
  Promise<WrapFormValidationContext>
> = async (values, validationContextPromise) => {
  const { amount, token } = values;
  try {
    invariant(
      validationContextPromise,
      'validation context must be presented as context promise',
    );

    validateEtherAmount('amount', amount, token);

    const { active, maxAmountETH, maxAmountStETH, stakeLimitLevel } =
      await awaitWithTimeout(
        validationContextPromise,
        VALIDATION_CONTEXT_TIMEOUT,
      );

    if (token === TOKENS_TO_WRAP.ETH) {
      validateStakeLimit('amount', stakeLimitLevel);
    }

    if (active) {
      const isSteth = token === TOKENS_TO_WRAP.STETH;
      const maxAmount = isSteth ? maxAmountStETH : maxAmountETH;

      invariant(maxAmount, 'maxAmount must be presented');

      validateBignumberMax(
        'amount',
        amount,
        maxAmount,
        messageMaxAmount(maxAmount, token),
      );
    }

    return {
      values,
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'WrapForm', 'amount');
  }
};
