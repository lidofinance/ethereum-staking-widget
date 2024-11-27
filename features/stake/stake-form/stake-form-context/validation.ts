import { useMemo } from 'react';
import type { Resolver } from 'react-hook-form';
import invariant from 'tiny-invariant';

import { useDappStatus } from 'modules/web3';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { validateStakeEth } from 'shared/hook-form/validation/validate-stake-eth';
import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';
import { awaitWithTimeout } from 'utils/await-with-timeout';

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

    validateEtherAmount('amount', amount, TOKENS_TO_WRAP.ETH);

    const {
      isWalletActive,
      stakingLimitLevel,
      currentStakeLimit,
      etherBalance,
      gasCost,
      isMultisig,
    } = await awaitWithTimeout(
      validationContextPromise,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    validateStakeEth({
      formField: 'amount',
      amount,
      isWalletActive,
      stakingLimitLevel,
      currentStakeLimit,
      etherBalance,
      gasCost,
      isMultisig,
    });

    if (!isWalletActive) {
      return {
        values,
        errors: { referral: 'wallet not connected' },
      };
    }

    return {
      values,
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'StakeForm', 'referral');
  }
};

export const useStakeFormValidationContext = (
  networkData: StakeFormNetworkData,
): Promise<StakeFormValidationContext> => {
  const { isDappActive } = useDappStatus();
  const { stakingLimitInfo, etherBalance, isMultisig, gasCost } = networkData;

  const validationContextAwaited = useMemo(() => {
    if (
      stakingLimitInfo &&
      // we ether not connected or must have all account related data
      (!isDappActive ||
        (etherBalance !== undefined &&
          gasCost !== undefined &&
          isMultisig !== undefined))
    ) {
      return {
        isWalletActive: isDappActive,
        stakingLimitLevel: stakingLimitInfo.stakeLimitLevel,
        currentStakeLimit: stakingLimitInfo.currentStakeLimit,
        // condition above guaranties stubs will only be passed when isDappActive = false
        etherBalance: etherBalance ?? 0n,
        gasCost: gasCost ?? 0n,
        isMultisig: isMultisig ?? false,
      };
    }
    return undefined;
  }, [isDappActive, etherBalance, gasCost, isMultisig, stakingLimitInfo]);

  return useAwaiter(validationContextAwaited).awaiter;
};
