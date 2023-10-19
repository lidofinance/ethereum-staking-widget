import { useMemo } from 'react';
import invariant from 'tiny-invariant';
import { formatEther } from '@ethersproject/units';
import { useWeb3 } from 'reef-knot/web3-react';

import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';
import { validateBignumberMax } from 'shared/hook-form/validation/validate-bignumber-max';
import { awaitWithTimeout } from 'utils/await-with-timeout';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

import { useAwaiter } from 'shared/hooks/use-awaiter';

import type { Resolver } from 'react-hook-form';
import type {
  StakeFormInput,
  StakeFormNetworkData,
  StakeFormValidationContext,
} from './types';

export const stakeFormValidationResolver: Resolver<
  StakeFormInput,
  Promise<StakeFormValidationContext>
> = async (values, validationContextPromise) => {
  const { amount } = values;
  try {
    invariant(
      validationContextPromise,
      'validation context must be presented as context promise',
    );

    validateEtherAmount('amount', amount, 'ETH');

    const { maxAmount, active } = await awaitWithTimeout(
      validationContextPromise,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    if (active) {
      validateBignumberMax(
        'amount',
        amount,
        maxAmount,
        `${getTokenDisplayName(
          'ETH',
        )} amount must not be greater than ${formatEther(maxAmount)}`,
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

export const useStakeFormValidationContext = (
  networkData: StakeFormNetworkData,
): Promise<StakeFormValidationContext> => {
  const { active } = useWeb3();
  const { maxAmount } = networkData;

  const validationContextAwaited = useMemo(() => {
    if (active && maxAmount) {
      return {
        active,
        maxAmount,
      };
    }
    return undefined;
  }, [active, maxAmount]);

  return useAwaiter(validationContextAwaited).awaiter;
};
