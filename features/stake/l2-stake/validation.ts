import { useMemo } from 'react';
import type { Resolver } from 'react-hook-form';
import invariant from 'tiny-invariant';

import { getPrettyChainName, useAA, useDappStatus } from 'modules/web3';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { validateStakeEth } from 'shared/hook-form/validation/validate-stake-eth';
import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { handleResolverValidationError } from 'shared/hook-form/validation/validation-error';
import { awaitWithTimeout } from 'utils/await-with-timeout';

import type {
  L2StakeFormInputType,
  L2StakeFormValidationContext,
  L2StakeFormNetworkData,
} from './types';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';
import { formatBalance } from 'utils/formatBalance';

export const L2StakeFormValidationResolver: Resolver<
  L2StakeFormInputType,
  Promise<L2StakeFormValidationContext>
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
      etherBalance,
      etherLiquidity,
      gasCost,
      isSmartAccount,
      shouldValidateEtherBalance,
      chainId,
    } = await awaitWithTimeout(
      validationContextPromise,
      VALIDATION_CONTEXT_TIMEOUT,
    );

    validateBigintMax(
      'amount',
      amount,
      etherLiquidity,
      `Entered ETH amount exceeds current staking limit on ${getPrettyChainName(chainId)} of ${formatBalance(etherLiquidity).trimmed} ETH`,
    );

    validateStakeEth({
      formField: 'amount',
      amount,
      isWalletActive,
      etherBalance,
      shouldValidateEtherBalance,
      gasCost,
      isSmartAccount,
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

export const useL2StakeFormValidationContext = (
  networkData: L2StakeFormNetworkData,
): Promise<L2StakeFormValidationContext> => {
  const { isDappActive, chainId } = useDappStatus();
  const { areAuxiliaryFundsSupported } = useAA();
  const { etherBalance, fastStakeLiquidityEth, isSmartAccount, gasCost } =
    networkData;

  const validationContextAwaited = useMemo(() => {
    if (
      // we ether not connected or must have all account related data
      !isDappActive ||
      (etherBalance !== undefined &&
        gasCost !== undefined &&
        isSmartAccount !== undefined &&
        fastStakeLiquidityEth !== undefined)
    ) {
      return {
        isWalletActive: isDappActive,
        chainId,
        shouldValidateEtherBalance: !areAuxiliaryFundsSupported,
        // condition above guaranties stubs will only be passed when isDappActive = false
        etherBalance: etherBalance ?? 0n,
        gasCost: gasCost ?? 0n,
        isSmartAccount: isSmartAccount ?? false,
        etherLiquidity: fastStakeLiquidityEth ?? 0n,
      };
    }
    return undefined;
  }, [
    isDappActive,
    etherBalance,
    gasCost,
    isSmartAccount,
    chainId,
    areAuxiliaryFundsSupported,
    fastStakeLiquidityEth,
  ]);

  return useAwaiter(validationContextAwaited).awaiter;
};
