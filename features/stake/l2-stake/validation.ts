import { useMemo } from 'react';
import type { Resolver } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  getPrettyChainName,
  useAA,
  useDappStatus,
  useLidoSDKL2,
} from 'modules/web3';
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
      gasCostEth,
      gasCostWeth,
      isSmartAccount,
      shouldValidateEtherBalance,
      chainId,
      etherLiquidityTarget,
    } = await awaitWithTimeout(
      validationContextByToken[token],
      VALIDATION_CONTEXT_TIMEOUT,
    );

    // The pool liquidity does not depend on a wallet, so the cap applies to
    // a visitor as well. It is absent only while the pool is not readable
    if (etherLiquidity !== undefined) {
      // default message, only used when we don't know target liquidity level
      let aboveLiquidityMessage = `Entered ${token} amount exceeds current staking limit on ${getPrettyChainName(chainId)} of ${formatBalance(etherLiquidity).trimmed} ETH`;

      // Pool Target Liquidity messages
      if (etherLiquidityTarget !== undefined) {
        // when pool is below its target liquidity, we show soft-error glow and special UI banner
        if (amount <= etherLiquidityTarget) aboveLiquidityMessage = '';
        // when pool is at target level or MORE we show a hard error message
        if (amount > etherLiquidityTarget)
          aboveLiquidityMessage = `Entered ${token} amount exceeds total pool capacity on ${getPrettyChainName(chainId)}`;
      }

      // It's important that final validation compares to etherLiquidity rather than target
      // target value can be stale and pool can have much more liquidity than the target
      validateBigintMax(
        'amount',
        amount,
        etherLiquidity,
        aboveLiquidityMessage,
      );
    }

    // Everything below is account data, stubbed while the dapp is inactive
    if (!isWalletActive) {
      return {
        values,
        errors: { referral: 'wallet not connected' },
      };
    }

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
  // the pool of the chain the form is on
  isLiquidityReadable: boolean;
  areAuxiliaryFundsSupported: boolean;
  chainId: number;
  liquidityTargetEth: bigint | undefined;
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
    isLiquidityReadable,
    areAuxiliaryFundsSupported,
    chainId,
    liquidityTargetEth,
  }: L2StakeFormValidationContextDeps,
): L2StakeFormValidationContext | undefined => {
  // The pool liquidity is a public read: it is waited for whenever the pool
  // can be read, wallet or not, and never stubbed. Only account data waits
  // for a connected wallet
  const isLiquidityReady =
    !isLiquidityReadable || fastStakeLiquidityEth !== undefined;
  const isAccountDataReady =
    !isDappActive ||
    (etherBalance !== undefined &&
      gasCostEth !== undefined &&
      gasCostWeth !== undefined &&
      isSmartAccount !== undefined);

  if (!isLiquidityReady || !isAccountDataReady) return undefined;

  return {
    isWalletActive: isDappActive,
    chainId,
    shouldValidateEtherBalance: !areAuxiliaryFundsSupported,
    etherLiquidity: fastStakeLiquidityEth,
    etherLiquidityTarget: liquidityTargetEth,
    // account data; the condition above guarantees the stubs are only passed
    // while isDappActive is false, where the resolver does not reach them
    etherBalance: etherBalance ?? 0n,
    gasCostEth: gasCostEth ?? 0n,
    gasCostWeth: gasCostWeth ?? 0n,
    isSmartAccount: isSmartAccount ?? false,
    // stubbed while loading; never reached by ETH validation
    wethBalance: wethBalance ?? 0n,
  };
};

export const useL2StakeFormValidationContext = (
  networkData: L2StakeFormNetworkData,
): L2StakeFormValidationContextByToken => {
  const { isDappActive, chainId } = useDappStatus();
  const { areAuxiliaryFundsSupported } = useAA();
  const { isL2Stake: isLiquidityReadable } = useLidoSDKL2();
  const { liquidityTargetEth } = useL2StakeState();
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
        {
          isDappActive,
          isLiquidityReadable,
          areAuxiliaryFundsSupported,
          chainId,
          liquidityTargetEth,
        },
      ),
    [
      etherBalance,
      wethBalance,
      fastStakeLiquidityEth,
      isSmartAccount,
      gasCostEth,
      gasCostWeth,
      isDappActive,
      isLiquidityReadable,
      areAuxiliaryFundsSupported,
      chainId,
      liquidityTargetEth,
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
