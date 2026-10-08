import { useMemo } from 'react';
import type { Resolver } from 'react-hook-form';
import invariant from 'tiny-invariant';

import { getPrettyChainName, useAA, useDappStatus } from 'modules/web3';
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
  L2StakeFormInputType,
  L2StakeFormValidationContext,
  L2StakeFormValidationContextByToken,
  L2StakeFormNetworkData,
} from './types';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';
import { formatBalance } from 'utils/formatBalance';

export const L2StakeFormValidationResolver: Resolver<
  L2StakeFormInputType,
  L2StakeFormValidationContextByToken
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
      etherBalance,
      wethBalance,
      etherLiquidity,
      gasCostEth,
      gasCostWeth,
      isSmartAccount,
      shouldValidateEtherBalance,
      chainId,
    } = await awaitWithTimeout(
      validationContextByToken[token],
      VALIDATION_CONTEXT_TIMEOUT,
    );

    validateBigintMax(
      'amount',
      amount,
      etherLiquidity,
      `Entered ${token} amount exceeds current staking limit on ${getPrettyChainName(chainId)} of ${formatBalance(etherLiquidity).trimmed} ETH`,
    );

    if (token === TOKENS_TO_STAKE.WETH) {
      validateStakeWeth({
        formField: 'amount',
        amount,
        isWalletActive,
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

type L2StakeFormValidationContextDeps = {
  isDappActive: boolean;
  areAuxiliaryFundsSupported: boolean;
  chainId: number;
};

type L2StakeFormValidationContextSource = Pick<
  L2StakeFormNetworkData,
  | 'etherBalance'
  | 'wethBalance'
  | 'fastStakeLiquidityEth'
  | 'isSmartAccount'
  | 'gasCostEth'
  | 'gasCostWeth'
>;

// Resolves once the ETH validation has its data; the WETH balance is not
// required here, so it is stubbed until it arrives and only WETH validation
// waits for it (see useValidationContextByToken)
export const getL2StakeFormValidationContext = (
  {
    etherBalance,
    wethBalance,
    fastStakeLiquidityEth,
    isSmartAccount,
    gasCostEth,
    gasCostWeth,
  }: L2StakeFormValidationContextSource,
  {
    isDappActive,
    areAuxiliaryFundsSupported,
    chainId,
  }: L2StakeFormValidationContextDeps,
): L2StakeFormValidationContext | undefined => {
  if (
    // we ether not connected or must have all account related data
    !isDappActive ||
    (etherBalance !== undefined &&
      gasCostEth !== undefined &&
      gasCostWeth !== undefined &&
      isSmartAccount !== undefined &&
      fastStakeLiquidityEth !== undefined)
  ) {
    return {
      isWalletActive: isDappActive,
      chainId,
      shouldValidateEtherBalance: !areAuxiliaryFundsSupported,
      // condition above guaranties stubs will only be passed when isDappActive = false
      etherBalance: etherBalance ?? 0n,
      gasCostEth: gasCostEth ?? 0n,
      gasCostWeth: gasCostWeth ?? 0n,
      isSmartAccount: isSmartAccount ?? false,
      etherLiquidity: fastStakeLiquidityEth ?? 0n,
      // stubbed while loading; never reached by ETH validation
      wethBalance: wethBalance ?? 0n,
    };
  }
  return undefined;
};

export const useL2StakeFormValidationContext = (
  networkData: L2StakeFormNetworkData,
): L2StakeFormValidationContextByToken => {
  const { isDappActive, chainId } = useDappStatus();
  const { areAuxiliaryFundsSupported } = useAA();
  const {
    etherBalance,
    wethBalance,
    isWethSupported,
    fastStakeLiquidityEth,
    isSmartAccount,
    gasCostEth,
    gasCostWeth,
  } = networkData;

  const context = useMemo(
    () =>
      getL2StakeFormValidationContext(
        {
          etherBalance,
          wethBalance,
          fastStakeLiquidityEth,
          isSmartAccount,
          gasCostEth,
          gasCostWeth,
        },
        { isDappActive, areAuxiliaryFundsSupported, chainId },
      ),
    [
      etherBalance,
      wethBalance,
      fastStakeLiquidityEth,
      isSmartAccount,
      gasCostEth,
      gasCostWeth,
      isDappActive,
      areAuxiliaryFundsSupported,
      chainId,
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
