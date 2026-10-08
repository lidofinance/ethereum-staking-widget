import {
  FC,
  PropsWithChildren,
  useMemo,
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { useFastStakeGasLimit } from './hooks/use-fast-stake-gas-limit';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  useEthereumBalance,
  useWethBalance,
  useIsSmartAccount,
  useWstethBalance,
  useMaxGasPrice,
  BALANCE_PADDING_L2,
  useDappStatus,
} from 'modules/web3';

import {
  FormControllerContext,
  FormControllerContextValueType,
  passFormState,
  recoverFormState,
} from 'shared/hook-form/form-controller';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import {
  useQueryParamsAmountForm,
  useQueryParamsReferralForm,
} from 'shared/hooks/use-query-values-form';
import { minBN } from 'utils/bn';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';

import { useL2FastStake } from './hooks/use-fast-stake';
import { useFastStakeLiquidity } from './hooks/use-fast-liquidity';
import { useL2StakeState } from './hooks/use-l2-stake-state';
import { useL2WethApprove } from './hooks/use-l2-weth-approve';
import { useL2WethAddresses } from './hooks/use-l2-weth-addresses';

import {
  L2StakeFormValidationResolver,
  useL2StakeFormValidationContext,
} from './validation';

import type {
  L2StakeFormDataContextValue,
  L2StakeFormInputType,
  L2StakeFormNetworkData,
  L2StakeFormValidationContextByToken,
} from './types';
import { parseEther } from 'viem';
import { useTrackStakeEvent } from './hooks/use-track-event';

//
// Data context
//
const L2StakeFormDataContext =
  createContext<L2StakeFormDataContextValue | null>(null);
L2StakeFormDataContext.displayName = 'L2StakeFormDataContext';

export const useL2StakeFormData = () => {
  const value = useContext(L2StakeFormDataContext);
  invariant(
    value,
    'useL2StakeFormData was used outside the L2StakeFormDataContext provider',
  );
  return value;
};

const useL2StakeFormNetworkData = (): L2StakeFormNetworkData => {
  const { isWethSupported } = useL2WethAddresses();
  const {
    data: wstethBalance,
    refetch: updateWstethBalance,
    isLoading: isWstethBalanceLoading,
  } = useWstethBalance();
  const { isSmartAccount, isLoading: isSmartAccountLoading } =
    useIsSmartAccount();
  const {
    gasLimitEth,
    gasLimitWeth: gasLimitWethStake,
    gasLimitWethApprove,
  } = useFastStakeGasLimit();
  // the approval is counted in even when the allowance is already there, so a
  // first-time staker never sees an understated max cost
  const gasLimitWeth = gasLimitWethStake + gasLimitWethApprove;
  const {
    data: fastStakeLiquidity,
    isLoading: isFastStakeLiquidityLoading,
    refetch: refetchFastStakeLiquidity,
  } = useFastStakeLiquidity();
  const { maxGasPrice, isLoading: isMaxGasPriceLoading } = useMaxGasPrice();

  const gasCostEth = useMemo(
    () => (maxGasPrice ? gasLimitEth * maxGasPrice : undefined),
    [gasLimitEth, maxGasPrice],
  );
  const gasCostWeth = useMemo(
    () => (maxGasPrice ? gasLimitWeth * maxGasPrice : undefined),
    [gasLimitWeth, maxGasPrice],
  );

  const {
    data: etherBalance,
    refetch: updateEtherBalance,
    isLoading: isEtherBalanceLoading,
  } = useEthereumBalance();
  const {
    data: wethBalance,
    refetch: updateWethBalance,
    isLoading: isWethBalanceLoading,
  } = useWethBalance();

  const fastStakeLiquidityEth = fastStakeLiquidity?.eth;

  // Unknown until both reads are in: with the liquidity missing the balance
  // alone would overstate what can be staked (and validation has nothing to
  // check it against)
  const stakeableEther = useMemo(() => {
    if (etherBalance === undefined || fastStakeLiquidityEth === undefined)
      return undefined;
    return minBN(etherBalance, fastStakeLiquidityEth);
  }, [etherBalance, fastStakeLiquidityEth]);

  const stakeableWeth = useMemo(() => {
    if (wethBalance === undefined || fastStakeLiquidityEth === undefined)
      return undefined;
    return minBN(wethBalance, fastStakeLiquidityEth);
  }, [wethBalance, fastStakeLiquidityEth]);

  const maxAmountEth = useTokenMaxAmount({
    balance: etherBalance,
    limit: fastStakeLiquidityEth,
    isPadded: !isSmartAccount,
    padding: BALANCE_PADDING_L2,
    gasLimit: gasLimitEth,
    isLoading: isSmartAccountLoading,
  });

  // gas is paid from the ETH balance, so the whole WETH balance can be staked
  const maxAmountWeth = useTokenMaxAmount({
    balance: wethBalance,
    limit: fastStakeLiquidityEth,
  });

  const revalidate = useCallback(async () => {
    await Promise.allSettled([
      updateWstethBalance(),
      updateEtherBalance(),
      updateWethBalance(),
      refetchFastStakeLiquidity(),
    ]);
  }, [
    updateWstethBalance,
    updateEtherBalance,
    updateWethBalance,
    refetchFastStakeLiquidity,
  ]);

  const loading = useMemo(
    () => ({
      isWstethBalanceLoading,
      isSmartAccountLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isWethBalanceLoading,
      isFastStakeLiquidityLoading,
      isStakeableEtherLoading:
        isFastStakeLiquidityLoading || isEtherBalanceLoading,
      isStakeableWethLoading:
        isFastStakeLiquidityLoading || isWethBalanceLoading,
    }),
    [
      isWstethBalanceLoading,
      isSmartAccountLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isWethBalanceLoading,
      isFastStakeLiquidityLoading,
    ],
  );

  return {
    wstethBalance,
    etherBalance,
    wethBalance,
    isWethSupported,
    fastStakeLiquidityEth,
    stakeableEther,
    stakeableWeth,
    isSmartAccount,
    gasCostEth,
    gasCostWeth,
    gasLimitEth,
    gasLimitWeth,
    maxAmountEth,
    maxAmountWeth,
    loading,
    revalidate,
  };
};

//
// Data provider
//
export const L2StakeFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const { chainId, address } = useDappStatus();
  const networkData = useL2StakeFormNetworkData();
  const validationContextByToken = useL2StakeFormValidationContext(networkData);
  const l2StakeState = useL2StakeState();
  const trackStakeEvent = useTrackStakeEvent('fast_stake_more_liquidity');

  const formObject = useForm<
    L2StakeFormInputType,
    L2StakeFormValidationContextByToken
  >({
    defaultValues: {
      amount: recoverFormState('stake').amount ?? null,
      token: recoverFormState('stake').token ?? TOKENS_TO_STAKE.ETH,
      referral: recoverFormState('stake').referral ?? null,
    },
    context: validationContextByToken,
    resolver: L2StakeFormValidationResolver,
    mode: 'onChange',
    disabled: !l2StakeState.isEnabled,
  });
  const { setValue, control } = formObject;
  useQueryParamsReferralForm<L2StakeFormInputType>({ setValue });
  useQueryParamsAmountForm<L2StakeFormInputType>({ setValue });

  const [token, amount] = useWatch({ control, name: ['token', 'amount'] });
  const isWeth = token === TOKENS_TO_STAKE.WETH;

  const approvalData = useL2WethApprove({ amount: amount ?? 0n, token });

  // WETH may be unavailable on the connected chain (or after a chain switch).
  // The selector is hidden there, so the token must be normalized here
  useEffect(() => {
    if (!approvalData.isWethSupported && token !== TOKENS_TO_STAKE.ETH) {
      setValue('token', TOKENS_TO_STAKE.ETH, { shouldValidate: true });
    }
  }, [approvalData.isWethSupported, token, setValue]);

  const { retryEvent, retryFire } = useFormControllerRetry();

  const onConfirm = useCallback(async () => {
    await Promise.allSettled([
      networkData.revalidate(),
      approvalData.refetchAllowance(),
    ]);
  }, [networkData, approvalData]);

  const stake = useL2FastStake({ onConfirm, onRetry: retryFire });

  // communicate the amount between L1 and L2 staking forms
  useEffect(() => {
    passFormState('stake', { amount });
  }, [amount]);

  const stakedTokenBalance = isWeth
    ? networkData.wethBalance
    : networkData.etherBalance;
  useEffect(() => {
    if (
      stakedTokenBalance !== undefined &&
      networkData.fastStakeLiquidityEth !== undefined &&
      chainId &&
      address &&
      amount &&
      l2StakeState.state.liquidityTarget
    ) {
      const liquidityTargetEth = parseEther(
        String(l2StakeState.state.liquidityTarget),
      );
      if (
        amount > liquidityTargetEth &&
        amount > networkData.fastStakeLiquidityEth &&
        amount <= stakedTokenBalance
      ) {
        trackStakeEvent();
      }
    }
  }, [
    stakedTokenBalance,
    networkData.fastStakeLiquidityEth,
    chainId,
    address,
    amount,
    l2StakeState.state.liquidityTarget,
    trackStakeEvent,
  ]);

  const formControllerValue: FormControllerContextValueType<L2StakeFormInputType> =
    useMemo(
      () => ({
        onSubmit: stake,
        retryEvent,
        onReset: ({ token, referral }) => {
          formObject.reset({
            amount: null,
            token,
            referral,
          });
        },
      }),
      [formObject, retryEvent, stake],
    );

  const l2StakeFormDataContextValue: L2StakeFormDataContextValue = useMemo(
    () => ({
      token,
      isWeth,
      isWethSupported: networkData.isWethSupported,
      stakeableAmount: isWeth
        ? networkData.stakeableWeth
        : networkData.stakeableEther,
      isStakeableAmountLoading: isWeth
        ? networkData.loading.isStakeableWethLoading
        : networkData.loading.isStakeableEtherLoading,
      maxAmount: isWeth ? networkData.maxAmountWeth : networkData.maxAmountEth,
      gasCost: isWeth ? networkData.gasCostWeth : networkData.gasCostEth,
      loading: networkData.loading,
      shouldShowUnlockRequirement: approvalData.shouldShowUnlockRequirement,
    }),
    [token, isWeth, networkData, approvalData.shouldShowUnlockRequirement],
  );

  return (
    <FormProvider {...formObject}>
      <L2StakeFormDataContext.Provider value={l2StakeFormDataContextValue}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </L2StakeFormDataContext.Provider>
    </FormProvider>
  );
};
