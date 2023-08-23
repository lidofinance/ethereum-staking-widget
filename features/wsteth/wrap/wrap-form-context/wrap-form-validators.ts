import invariant from 'tiny-invariant';
import { formatEther } from '@ethersproject/units';
import type { BigNumber } from 'ethers';
import type { Resolver } from 'react-hook-form';

import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { validateBignumberMax } from 'shared/hook-form/validation/validate-bignumber-max';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { computeWrapFormContextValues } from './compute-wrap-form-context-values';
import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';

import { awaitWithTimeout } from 'utils/await-with-timeout';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import type { WrapFormInputType, WrapFormNetworkData } from './types';
import type { TokensWrappable } from 'features/wsteth/shared/types';

const messageMaxAmount = (max: BigNumber, token: TokensWrappable) =>
  `${getTokenDisplayName(token)} amount must not be greater than ${formatEther(
    max,
  )}`;

export const WrapFormValidationResolver: Resolver<
  WrapFormInputType,
  Promise<WrapFormNetworkData>
> = async (values, networkDataPromise) => {
  const { amount, token } = values;
  try {
    invariant(networkDataPromise, 'must have context promise');

    validateEtherAmount('amount', amount, token);

    const networkData = await awaitWithTimeout(
      networkDataPromise,
      VALIDATION_CONTEXT_TIMEOUT,
    );
    const { maxAmount } = computeWrapFormContextValues({ token, networkData });

    invariant(maxAmount, 'maxAmount must be computed');

    validateBignumberMax(
      'amount',
      amount,
      maxAmount,
      messageMaxAmount(maxAmount, token),
    );

    return {
      values,
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'WrapForm', 'amount');
  }
};
