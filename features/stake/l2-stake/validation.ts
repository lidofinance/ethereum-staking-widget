import { useCallback, useMemo } from 'react';
import type { Resolver } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useAA, useDappStatus, useLidoSDKL2 } from 'modules/web3';
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

import { L2_STAKE_LANE, resolveL2StakeLane } from './lane';
import { validateFastLaneAmount } from './fast-lane/validation';
import { validateSlowLaneAmount } from './slow-lane/validation';
import { getSlowStakeFeeQueryOptions } from './slow-lane/use-slow-stake-fee';

import type {
  L2StakeFormInputType,
  L2StakeFormValidationContext,
  L2StakeFormValidationContextByToken,
  L2StakeFormNetworkData,
} from './types';
import { useL2StakeState } from './hooks/use-l2-stake-state';

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
      etherLiquidityTarget,
      gasCostEth,
      gasCostWeth,
      gasCostEthSlow,
      gasCostWethSlow,
      fetchSlowStakeFrontedFee,
      slowStakeLimits,
      isFastLaneAvailable,
      isSlowLaneAvailable,
      isSmartAccount,
      shouldValidateEtherBalance,
      chainId,
    } = await awaitWithTimeout(
      validationContextByToken[token],
      VALIDATION_CONTEXT_TIMEOUT,
    );

    // The same resolution the form shows, so the rule applied is the lane's
    // the user is looking at. Lane caps are public reads and apply to a
    // visitor as well
    const lane = resolveL2StakeLane({
      amount,
      fastLaneLiquidity: etherLiquidity,
      isFastLaneAvailable,
      isSlowLaneAvailable,
    });
    const isSlowLane = lane === L2_STAKE_LANE.slow;

    if (isSlowLane) {
      validateSlowLaneAmount('amount', amount, token, {
        limits: slowStakeLimits,
        chainId,
      });
    } else if (etherLiquidity !== undefined) {
      // absent only while the pool is not readable
      validateFastLaneAmount('amount', amount, token, {
        etherLiquidity,
        etherLiquidityTarget,
        chainId,
      });
    }

    // Everything below is account data, stubbed while the dapp is inactive
    if (!isWalletActive) {
      return {
        values,
        errors: { referral: 'wallet not connected' },
      };
    }

    // what the stake costs on top of the amount: the slow lane fronts the
    // CCIP cap and the return budget in the same transaction, quoted for
    // this amount. A failed quote does not fail the field: the send quotes
    // again right before the wallet
    let slowStakeFrontedFee = 0n;
    if (isSlowLane && fetchSlowStakeFrontedFee) {
      try {
        slowStakeFrontedFee = await awaitWithTimeout(
          fetchSlowStakeFrontedFee(amount),
          VALIDATION_CONTEXT_TIMEOUT,
        );
      } catch (error) {
        console.warn('[l2-stake-validation] slow stake quote failed', error);
      }
    }
    const gasCost = isSlowLane
      ? (token === TOKENS_TO_STAKE.WETH ? gasCostWethSlow : gasCostEthSlow) +
        slowStakeFrontedFee
      : token === TOKENS_TO_STAKE.WETH
        ? gasCostWeth
        : gasCostEth;

    if (token === TOKENS_TO_STAKE.WETH) {
      validateStakeWeth({
        formField: 'amount',
        amount,
        isWalletActive,
        wethBalance,
        etherBalance,
        gasCost,
        isSmartAccount,
      });
    } else {
      validateStakeEth({
        formField: 'amount',
        amount,
        isWalletActive,
        etherBalance,
        shouldValidateEtherBalance,
        gasCost,
        isSmartAccount,
      });
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
  // false while the wallet sits on another chain, where the SDK cannot read
  // the pool (or the CCIP bucket) of the chain the form is on
  isLiquidityReadable: boolean;
  areAuxiliaryFundsSupported: boolean;
  chainId: number;
  liquidityTargetEth: bigint | undefined;
  isFastLaneAvailable: boolean;
  isSlowLaneAvailable: boolean;
  // quotes the CCIP cap plus return budget for an amount; absent while the
  // slow lane is not offered
  fetchSlowStakeFrontedFee?: (amount: bigint) => Promise<bigint>;
};

type L2StakeFormValidationContextSource = Pick<
  L2StakeFormNetworkData,
  | 'etherBalance'
  | 'wethBalance'
  | 'fastStakeLiquidityEth'
  | 'slowStakeLimits'
  | 'isSmartAccount'
  | 'gasCostEth'
  | 'gasCostWeth'
  | 'gasCostEthSlow'
  | 'gasCostWethSlow'
>;

// Resolves once the ETH validation has its data; the WETH balance is not
// required here, so it is stubbed until it arrives and only WETH validation
// waits for it (see useValidationContextByToken)
export const getL2StakeFormValidationContext = (
  {
    etherBalance,
    wethBalance,
    fastStakeLiquidityEth,
    slowStakeLimits,
    isSmartAccount,
    gasCostEth,
    gasCostWeth,
    gasCostEthSlow,
    gasCostWethSlow,
  }: L2StakeFormValidationContextSource,
  {
    isDappActive,
    isLiquidityReadable,
    areAuxiliaryFundsSupported,
    chainId,
    liquidityTargetEth,
    isFastLaneAvailable,
    isSlowLaneAvailable,
    fetchSlowStakeFrontedFee,
  }: L2StakeFormValidationContextDeps,
): L2StakeFormValidationContext | undefined => {
  // The lane caps are public reads: they are waited for whenever the chain
  // can be read, wallet or not, and never stubbed. The slow lane's bucket is
  // only waited for while that lane is offered. Only account data waits for
  // a connected wallet
  const isLiquidityReady =
    !isLiquidityReadable || fastStakeLiquidityEth !== undefined;
  const isSlowLimitsReady =
    !isLiquidityReadable ||
    !isSlowLaneAvailable ||
    slowStakeLimits !== undefined;
  const isAccountDataReady =
    !isDappActive ||
    (etherBalance !== undefined &&
      gasCostEth !== undefined &&
      gasCostWeth !== undefined &&
      (!isSlowLaneAvailable ||
        (gasCostEthSlow !== undefined && gasCostWethSlow !== undefined)) &&
      isSmartAccount !== undefined);

  if (!isLiquidityReady || !isSlowLimitsReady || !isAccountDataReady)
    return undefined;

  return {
    isWalletActive: isDappActive,
    chainId,
    shouldValidateEtherBalance: !areAuxiliaryFundsSupported,
    isFastLaneAvailable,
    isSlowLaneAvailable,
    etherLiquidity: fastStakeLiquidityEth,
    etherLiquidityTarget: liquidityTargetEth,
    slowStakeLimits,
    fetchSlowStakeFrontedFee,
    // account data; the condition above guarantees the stubs are only passed
    // while isDappActive is false, where the resolver does not reach them
    etherBalance: etherBalance ?? 0n,
    gasCostEth: gasCostEth ?? 0n,
    gasCostWeth: gasCostWeth ?? 0n,
    gasCostEthSlow: gasCostEthSlow ?? 0n,
    gasCostWethSlow: gasCostWethSlow ?? 0n,
    isSmartAccount: isSmartAccount ?? false,
    // stubbed while loading; never reached by ETH validation
    wethBalance: wethBalance ?? 0n,
  };
};

export const useL2StakeFormValidationContext = (
  networkData: L2StakeFormNetworkData,
): L2StakeFormValidationContextByToken => {
  const { isDappActive, chainId, address } = useDappStatus();
  const { areAuxiliaryFundsSupported } = useAA();
  const {
    isL2Stake: isLiquidityReadable,
    l2Stake,
    chainId: sdkChainId,
  } = useLidoSDKL2();
  const { liquidityTargetEth, fastLane, slowLane } = useL2StakeState();
  const queryClient = useQueryClient();

  // The slow lane's quote depends on the amount, which the resolver has and
  // the context does not: the context hands over the quote itself, through
  // the query the form's display reads, so both share one cache entry
  const fetchSlowStakeFrontedFee = useCallback(
    async (amount: bigint) => {
      const fee = await queryClient.fetchQuery(
        getSlowStakeFeeQueryOptions({
          l2Stake,
          chainId: sdkChainId,
          amount,
          account: address,
        }),
      );
      return fee.maxFee + fee.feeAmountDtoO;
    },
    [queryClient, l2Stake, sdkChainId, address],
  );
  const {
    etherBalance,
    wethBalance,
    isWethSupported,
    fastStakeLiquidityEth,
    slowStakeLimits,
    isSmartAccount,
    gasCostEth,
    gasCostWeth,
    gasCostEthSlow,
    gasCostWethSlow,
  } = networkData;

  const context = useMemo(
    () =>
      getL2StakeFormValidationContext(
        {
          etherBalance,
          wethBalance,
          fastStakeLiquidityEth,
          slowStakeLimits,
          isSmartAccount,
          gasCostEth,
          gasCostWeth,
          gasCostEthSlow,
          gasCostWethSlow,
        },
        {
          isDappActive,
          isLiquidityReadable,
          areAuxiliaryFundsSupported,
          chainId,
          liquidityTargetEth,
          isFastLaneAvailable: fastLane.isAvailable,
          isSlowLaneAvailable: slowLane.isAvailable,
          fetchSlowStakeFrontedFee: slowLane.isAvailable
            ? fetchSlowStakeFrontedFee
            : undefined,
        },
      ),
    [
      etherBalance,
      wethBalance,
      fastStakeLiquidityEth,
      slowStakeLimits,
      isSmartAccount,
      gasCostEth,
      gasCostWeth,
      gasCostEthSlow,
      gasCostWethSlow,
      isDappActive,
      isLiquidityReadable,
      areAuxiliaryFundsSupported,
      chainId,
      liquidityTargetEth,
      fastLane.isAvailable,
      slowLane.isAvailable,
      fetchSlowStakeFrontedFee,
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
