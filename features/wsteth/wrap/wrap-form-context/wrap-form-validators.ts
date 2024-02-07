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
import { validateStakeEth } from 'shared/hook-form/validation/validate-stake-eth';

const messageMaxAmount = (max: BigNumber, token: TokensWrappable) =>
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
    const { isWalletActive, asyncContext } = validationContext;

    validateEtherAmount('amount', amount, token);

    const awaitedContext = await awaitWithTimeout(
      asyncContext,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    if (token === TOKENS_TO_WRAP.ETH) {
      // checks active internally after other wallet-less check
      validateStakeEth({
        formField: 'amount',
        isWalletActive,
        amount,
        ...awaitedContext,
      });
    } else if (isWalletActive) {
      validateBignumberMax(
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
