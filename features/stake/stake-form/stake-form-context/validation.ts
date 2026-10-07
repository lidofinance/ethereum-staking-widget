import { useMemo } from 'react';
import type { Resolver } from 'react-hook-form';
import invariant from 'tiny-invariant';

import { useAA, useDappStatus } from 'modules/web3';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { validateStakeEth } from 'shared/hook-form/validation/validate-stake-eth';
import { validateStakeWeth } from 'shared/hook-form/validation/validate-stake-weth';
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
  const { amount, token } = values;
  try {
    invariant(
      validationContextPromise,
      'validation context must be presented as context promise',
    );

    validateEtherAmount('amount', amount, token);

    const {
      isWalletActive,
      stakingLimitLevel,
      currentStakeLimit,
      etherBalance,
      wethBalance,
      gasCostEth,
      gasCostWeth,
      isSmartAccount,
      shouldValidateEtherBalance,
    } = await awaitWithTimeout(
      validationContextPromise,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    if (token === TOKENS_TO_STAKE.WETH) {
      validateStakeWeth({
        formField: 'amount',
        amount,
        isWalletActive,
        stakingLimitLevel,
        currentStakeLimit,
        wethBalance,
        etherBalance,
        gasCost: gasCostWeth,
        isSmartAccount,
      });
    } else {
      validateStakeEth({
        formField: 'amount',
        amount,
        isWalletActive,
        stakingLimitLevel,
        currentStakeLimit,
        etherBalance,
        shouldValidateEtherBalance,
        gasCost: gasCostEth,
        isSmartAccount,
      });
    }

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
  const { areAuxiliaryFundsSupported } = useAA();
  const {
    stakingLimitInfo,
    etherBalance,
    wethBalance,
    isWethSupported,
    isSmartAccount,
    gasCostEth,
    gasCostWeth,
  } = networkData;

  const validationContextAwaited = useMemo(() => {
    if (
      stakingLimitInfo &&
      // we ether not connected or must have all account related data
      (!isDappActive ||
        (etherBalance !== undefined &&
          gasCostEth !== undefined &&
          gasCostWeth !== undefined &&
          isSmartAccount !== undefined &&
          // the WETH balance only resolves on chains that have WETH
          (!isWethSupported || wethBalance !== undefined)))
    ) {
      return {
        isWalletActive: isDappActive,
        stakingLimitLevel: stakingLimitInfo.stakeLimitLevel,
        currentStakeLimit: stakingLimitInfo.currentStakeLimit,
        shouldValidateEtherBalance: !areAuxiliaryFundsSupported,
        // condition above guaranties stubs will only be passed when isDappActive = false
        etherBalance: etherBalance ?? 0n,
        wethBalance: wethBalance ?? 0n,
        gasCostEth: gasCostEth ?? 0n,
        gasCostWeth: gasCostWeth ?? 0n,
        isSmartAccount: isSmartAccount ?? false,
      };
    }
    return undefined;
  }, [
    stakingLimitInfo,
    isDappActive,
    etherBalance,
    wethBalance,
    isWethSupported,
    gasCostEth,
    gasCostWeth,
    isSmartAccount,
    areAuxiliaryFundsSupported,
  ]);

  return useAwaiter(validationContextAwaited).awaiter;
};
