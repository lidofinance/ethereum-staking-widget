import {
  FC,
  PropsWithChildren,
  useMemo,
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { useFastStakeGasLimit } from './fast-lane/use-fast-stake-gas-limit';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  useEthereumBalance,
  useWethBalance,
  useIsSmartAccount,
  useWstethBalance,
  useMaxTxCost,
  BALANCE_PADDING_L2,
  ESTIMATE_AMOUNT_L2,
  useDappStatus,
} from 'modules/web3';

import {
  FormControllerContext,
  FormControllerContextValueType,
  passFormStateTo,
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

import { useL2FastStake } from './fast-lane/use-fast-stake';
import { useFastStakeLiquidity } from './fast-lane/use-fast-liquidity';
import { useL2SlowStake } from './slow-lane/use-slow-stake';
import { useSlowStakeLimits } from './slow-lane/use-slow-stake-limits';
import { useSlowStakeFee } from './slow-lane/use-slow-stake-fee';
import { useSlowStakeGasLimit } from './slow-lane/use-slow-stake-gas-limit';
import { L2_STAKE_LANE, resolveL2StakeLane } from './lane';
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

type UseL2StakeFormNetworkDataArgs = {
  isFastLaneAvailable: boolean;
  isSlowLaneAvailable: boolean;
};

const useL2StakeFormNetworkData = ({
  isFastLaneAvailable,
  isSlowLaneAvailable,
}: UseL2StakeFormNetworkDataArgs): L2StakeFormNetworkData => {
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
    txEth,
    txWeth,
    txWethApprove,
  } = useFastStakeGasLimit();
  // the approval is counted in even when the allowance is already there, so a
  // first-time staker never sees an understated max cost
  const gasLimitWeth = gasLimitWethStake + gasLimitWethApprove;
  const {
    data: fastStakeLiquidity,
    isLoading: isFastStakeLiquidityLoading,
    refetch: refetchFastStakeLiquidity,
  } = useFastStakeLiquidity();
  const {
    data: slowStakeLimits,
    isLoading: isSlowStakeLimitsLoading,
    refetch: refetchSlowStakeLimits,
  } = useSlowStakeLimits();
  const {
    gasLimitEth: gasLimitEthSlow,
    gasLimitWeth: gasLimitWethSlowStake,
    txEth: txEthSlow,
    txWeth: txWethSlow,
  } = useSlowStakeGasLimit();
  const gasLimitWethSlow = gasLimitWethSlowStake + gasLimitWethApprove;

  // costs are quoted per tx: the chain's fee model may add an L1 data fee or
  // price the tx by its calldata, so the two WETH txs are quoted separately
  const { maxTxCost: gasCostEth, isLoading: isGasCostEthLoading } =
    useMaxTxCost({ gasLimit: gasLimitEth, tx: txEth });
  const { maxTxCost: gasCostWethStake, isLoading: isGasCostWethStakeLoading } =
    useMaxTxCost({ gasLimit: gasLimitWethStake, tx: txWeth });
  const {
    maxTxCost: gasCostWethApprove,
    isLoading: isGasCostWethApproveLoading,
  } = useMaxTxCost({ gasLimit: gasLimitWethApprove, tx: txWethApprove });

  const gasCostWeth = useMemo(
    () =>
      gasCostWethStake !== undefined && gasCostWethApprove !== undefined
        ? gasCostWethStake + gasCostWethApprove
        : undefined,
    [gasCostWethStake, gasCostWethApprove],
  );
  // the slow lane's L2 gas, the same approval in front of a WETH stake
  const { maxTxCost: gasCostEthSlow, isLoading: isGasCostEthSlowLoading } =
    useMaxTxCost({ gasLimit: gasLimitEthSlow, tx: txEthSlow });
  const {
    maxTxCost: gasCostWethSlowStake,
    isLoading: isGasCostWethSlowLoading,
  } = useMaxTxCost({ gasLimit: gasLimitWethSlowStake, tx: txWethSlow });
  const gasCostWethSlow = useMemo(
    () =>
      gasCostWethSlowStake !== undefined && gasCostWethApprove !== undefined
        ? gasCostWethSlowStake + gasCostWethApprove
        : undefined,
    [gasCostWethSlowStake, gasCostWethApprove],
  );
  const isMaxGasPriceLoading =
    isGasCostEthLoading ||
    isGasCostWethStakeLoading ||
    isGasCostWethApproveLoading ||
    isGasCostEthSlowLoading ||
    isGasCostWethSlowLoading;

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

  // The cap on an amount: with the slow lane offered, what its bucket takes
  // right now (the pool's liquidity only decides the lane); without it, the
  // pool's liquidity. Unknown until read: with the cap missing the balance
  // alone would overstate what can be staked (and validation has nothing to
  // check it against)
  const stakeCap = isSlowLaneAvailable
    ? slowStakeLimits && (slowStakeLimits.availableAmount ?? etherBalance)
    : fastStakeLiquidityEth;
  const isStakeCapLoading = isSlowLaneAvailable
    ? isSlowStakeLimitsLoading
    : isFastStakeLiquidityLoading;

  const stakeableEther = useMemo(() => {
    if (etherBalance === undefined || stakeCap === undefined) return undefined;
    return minBN(etherBalance, stakeCap);
  }, [etherBalance, stakeCap]);

  const stakeableWeth = useMemo(() => {
    if (wethBalance === undefined || stakeCap === undefined) return undefined;
    return minBN(wethBalance, stakeCap);
  }, [wethBalance, stakeCap]);

  // The max leaves room for the cost of the lane the max itself lands on.
  // On the slow lane that is more than gas: the CCIP cap and the return
  // budget are fronted too, so they are quoted for the stakeable amount
  const maxLane = resolveL2StakeLane({
    amount: stakeableEther ?? null,
    fastLaneLiquidity: fastStakeLiquidityEth,
    isFastLaneAvailable,
    isSlowLaneAvailable,
  });
  const isMaxOnSlowLane = maxLane === L2_STAKE_LANE.slow;
  const { data: slowStakeCapFee, isLoading: isSlowStakeCapFeeLoading } =
    useSlowStakeFee({
      amount: stakeableEther ?? null,
      enabled: isMaxOnSlowLane,
    });
  const maxCostEthSlow = useMemo(
    () =>
      gasCostEthSlow !== undefined && slowStakeCapFee !== undefined
        ? gasCostEthSlow +
          slowStakeCapFee.maxFee +
          slowStakeCapFee.feeAmountDtoO
        : undefined,
    [gasCostEthSlow, slowStakeCapFee],
  );
  const maxAmountEth = useTokenMaxAmount({
    balance: etherBalance,
    limit: stakeCap,
    isPadded: !isSmartAccount,
    padding: BALANCE_PADDING_L2,
    gasCost: isMaxOnSlowLane ? maxCostEthSlow : gasCostEth,
    isLoading:
      isSmartAccountLoading ||
      isStakeCapLoading ||
      (isMaxOnSlowLane && isSlowStakeCapFeeLoading),
  });

  // gas is paid from the ETH balance, so the whole WETH balance can be staked
  const maxAmountWeth = useTokenMaxAmount({
    balance: wethBalance,
    limit: stakeCap,
    isLoading: isStakeCapLoading,
  });

  const revalidate = useCallback(async () => {
    await Promise.allSettled([
      updateWstethBalance(),
      updateEtherBalance(),
      updateWethBalance(),
      refetchFastStakeLiquidity(),
      refetchSlowStakeLimits(),
    ]);
  }, [
    updateWstethBalance,
    updateEtherBalance,
    updateWethBalance,
    refetchFastStakeLiquidity,
    refetchSlowStakeLimits,
  ]);

  const loading = useMemo(
    () => ({
      isWstethBalanceLoading,
      isSmartAccountLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isWethBalanceLoading,
      isFastStakeLiquidityLoading,
      isSlowStakeLimitsLoading,
      isStakeableEtherLoading: isStakeCapLoading || isEtherBalanceLoading,
      isStakeableWethLoading: isStakeCapLoading || isWethBalanceLoading,
    }),
    [
      isWstethBalanceLoading,
      isSmartAccountLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isWethBalanceLoading,
      isFastStakeLiquidityLoading,
      isSlowStakeLimitsLoading,
      isStakeCapLoading,
    ],
  );

  return {
    wstethBalance,
    etherBalance,
    wethBalance,
    isWethSupported,
    fastStakeLiquidityEth,
    slowStakeLimits,
    stakeableEther,
    stakeableWeth,
    isSmartAccount,
    gasCostEth,
    gasCostWeth,
    gasCostEthSlow,
    gasCostWethSlow,
    gasLimitEth,
    gasLimitWeth,
    gasLimitEthSlow,
    gasLimitWethSlow,
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
  const l2StakeState = useL2StakeState();
  const { fastLane, slowLane } = l2StakeState;
  const networkData = useL2StakeFormNetworkData({
    isFastLaneAvailable: fastLane.isAvailable,
    isSlowLaneAvailable: slowLane.isAvailable,
  });
  const validationContextByToken = useL2StakeFormValidationContext(networkData);
  const trackStakeEvent = useTrackStakeEvent('fast_stake_more_liquidity');

  const recoveredState = recoverFormState('stakeL2');

  const formObject = useForm<
    L2StakeFormInputType,
    L2StakeFormValidationContextByToken
  >({
    defaultValues: {
      amount: recoveredState.amount ?? null,
      token: recoveredState.token ?? TOKENS_TO_STAKE.ETH,
      referral: recoveredState.referral ?? null,
    },
    context: validationContextByToken,
    resolver: L2StakeFormValidationResolver,
    mode: 'onChange',
    disabled: !l2StakeState.isEnabled,
  });
  const { setValue, control, trigger, getValues } = formObject;
  useQueryParamsReferralForm<L2StakeFormInputType>({ setValue });
  useQueryParamsAmountForm<L2StakeFormInputType>({ setValue });

  // The amount survives a chain switch (the form resets on the wallet
  // address only), but what it is validated against does not: another
  // chain brings its own pool, bucket and lane set, and the data moves on
  // the same chain as well. The context object changes whenever its data
  // does, after the awaiter has been replaced, so keying on it rather than
  // on the chain id alone never re-validates against the previous chain
  useEffect(() => {
    if (getValues('amount') === null) return;
    void trigger('amount');
  }, [chainId, validationContextByToken, trigger, getValues]);

  const [token, amount, referral] = useWatch({
    control,
    name: ['token', 'amount', 'referral'],
  });
  const isWeth = token === TOKENS_TO_STAKE.WETH;

  // The lane the entered amount goes to. Resolved here, once per render,
  // and handed to the context, the validation and the submit alike: the lane
  // the form shows is the lane the stake is sent on
  const lane = resolveL2StakeLane({
    amount,
    fastLaneLiquidity: networkData.fastStakeLiquidityEth,
    isFastLaneAvailable: fastLane.isAvailable,
    isSlowLaneAvailable: slowLane.isAvailable,
  });
  const isSlowLane = lane === L2_STAKE_LANE.slow;

  // the quote shown for the amount; the validation and the send read the
  // same query for it
  // With no amount yet, the quote is for the estimate amount, as the fast
  // lane's gas estimate is: the cost row has a figure before the first
  // keystroke on a chain that only offers the slow lane
  const quotedAmount = amount && amount > 0n ? amount : ESTIMATE_AMOUNT_L2;
  const {
    data: slowStakeFee,
    isLoading: isSlowStakeFeeLoading,
    // the previous amount's quote stands in while this one loads
    isPlaceholderData: isSlowStakeFeeStale,
    refetch: refetchSlowStakeFee,
  } = useSlowStakeFee({ amount: quotedAmount, enabled: isSlowLane });
  // The upper bound of what the stake costs on top of the amount. On the
  // slow lane the send fronts the CCIP cap and the return budget with the
  // gas; the cap's unspent part comes back in the same transaction, so the
  // bound is a bound, not the expected cost (that is the quote's `total`)
  const maxTxCost = useMemo(() => {
    const gasCost = isSlowLane
      ? isWeth
        ? networkData.gasCostWethSlow
        : networkData.gasCostEthSlow
      : isWeth
        ? networkData.gasCostWeth
        : networkData.gasCostEth;
    if (!isSlowLane) return gasCost;
    if (gasCost === undefined || slowStakeFee === undefined) return undefined;
    return gasCost + slowStakeFee.maxFee + slowStakeFee.feeAmountDtoO;
  }, [isSlowLane, isWeth, networkData, slowStakeFee]);

  // communicate the amount between L1 and L2 staking forms
  useEffect(() => {
    passFormStateTo('stake', { amount, token, referral });
  }, [amount, token, referral]);

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

  const fastStake = useL2FastStake({ onConfirm, onRetry: retryFire });
  const slowStake = useL2SlowStake({
    onConfirm,
    onRetry: retryFire,
    // only a quote for the amount itself is a reference for the send; a
    // stand-in from another amount is not held against the live one
    shownFee: isSlowStakeFeeStale ? undefined : slowStakeFee,
    refetchFee: refetchSlowStakeFee,
  });
  // dispatched by the lane of this render, the one the form is showing
  const stake = isSlowLane ? slowStake : fastStake;

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
        trackStakeEvent({ token });
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
    token,
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
        // keeps state between L1/L2 changes
        resetFormOn: 'walletAddress',
      }),
      [formObject, retryEvent, stake],
    );

  const l2StakeFormDataContextValue: L2StakeFormDataContextValue = useMemo(
    () => ({
      token,
      isWeth,
      lane,
      isFastLane: !isSlowLane,
      isSlowLane,
      slowStakeFee: isSlowLane ? slowStakeFee : undefined,
      isWethSupported: networkData.isWethSupported,
      stakeableAmount: isWeth
        ? networkData.stakeableWeth
        : networkData.stakeableEther,
      isStakeableAmountLoading: isWeth
        ? networkData.loading.isStakeableWethLoading
        : networkData.loading.isStakeableEtherLoading,
      maxAmount: isWeth ? networkData.maxAmountWeth : networkData.maxAmountEth,
      gasCost: maxTxCost,
      loading: {
        ...networkData.loading,
        isMaxGasPriceLoading:
          networkData.loading.isMaxGasPriceLoading ||
          (isSlowLane && isSlowStakeFeeLoading),
      },
      shouldShowUnlockRequirement: approvalData.shouldShowUnlockRequirement,
    }),
    [
      token,
      isWeth,
      lane,
      isSlowLane,
      slowStakeFee,
      isSlowStakeFeeLoading,
      maxTxCost,
      networkData,
      approvalData.shouldShowUnlockRequirement,
    ],
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
