import { useMemo } from 'react';
import type { Resolver } from 'react-hook-form';
import invariant from 'tiny-invariant';

import { useAA, useDappStatus } from 'modules/web3';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import {
  isWethBalanceReady,
  useValidationContextByToken,
} from 'features/stake/shared/validation-context-by-token';
import { validateStakeEth } from 'shared/hook-form/validation/validate-stake-eth';
import { validateStakeWeth } from 'shared/hook-form/validation/validate-stake-weth';
import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';
import { awaitWithTimeout } from 'utils/await-with-timeout';

import type {
  StakeFormInput,
  StakeFormNetworkData,
  StakeFormValidationContext,
  StakeFormValidationContextByToken,
} from './types';

export const stakeFormValidationResolver: Resolver<
  StakeFormInput,
  StakeFormValidationContextByToken
> = async (values, validationContextByToken) => {
  const { amount, token } = values;
  try {
    invariant(
      validationContextByToken,
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
      validationContextByToken[token],
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

type StakeFormValidationContextDeps = {
  isDappActive: boolean;
  areAuxiliaryFundsSupported: boolean;
};

type StakeFormValidationContextSource = Pick<
  StakeFormNetworkData,
  | 'stakingLimitInfo'
  | 'etherBalance'
  | 'wethBalance'
  | 'isSmartAccount'
  | 'gasCostEth'
  | 'gasCostWeth'
>;

// Resolves once the ETH validation has its data; the WETH balance is not
// required here, so it is stubbed until it arrives and only WETH validation
// waits for it (see useValidationContextByToken)
export const getStakeFormValidationContext = (
  {
    stakingLimitInfo,
    etherBalance,
    wethBalance,
    isSmartAccount,
    gasCostEth,
    gasCostWeth,
  }: StakeFormValidationContextSource,
  { isDappActive, areAuxiliaryFundsSupported }: StakeFormValidationContextDeps,
): StakeFormValidationContext | undefined => {
  if (
    stakingLimitInfo &&
    // we ether not connected or must have all account related data
    (!isDappActive ||
      (etherBalance !== undefined &&
        gasCostEth !== undefined &&
        gasCostWeth !== undefined &&
        isSmartAccount !== undefined))
  ) {
    return {
      isWalletActive: isDappActive,
      stakingLimitLevel: stakingLimitInfo.stakeLimitLevel,
      currentStakeLimit: stakingLimitInfo.currentStakeLimit,
      shouldValidateEtherBalance: !areAuxiliaryFundsSupported,
      // condition above guaranties stubs will only be passed when isDappActive = false
      etherBalance: etherBalance ?? 0n,
      gasCostEth: gasCostEth ?? 0n,
      gasCostWeth: gasCostWeth ?? 0n,
      isSmartAccount: isSmartAccount ?? false,
      // stubbed while loading; never reached by ETH validation
      wethBalance: wethBalance ?? 0n,
    };
  }
  return undefined;
};

export const useStakeFormValidationContext = (
  networkData: StakeFormNetworkData,
): StakeFormValidationContextByToken => {
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

  const context = useMemo(
    () =>
      getStakeFormValidationContext(
        {
          stakingLimitInfo,
          etherBalance,
          wethBalance,
          isSmartAccount,
          gasCostEth,
          gasCostWeth,
        },
        { isDappActive, areAuxiliaryFundsSupported },
      ),
    [
      stakingLimitInfo,
      etherBalance,
      wethBalance,
      isSmartAccount,
      gasCostEth,
      gasCostWeth,
      isDappActive,
      areAuxiliaryFundsSupported,
    ],
  );

  return useValidationContextByToken({
    context,
    isWethBalanceReady: isWethBalanceReady({
      isDappActive,
      isWethSupported,
      wethBalance,
    }),
  });
};
