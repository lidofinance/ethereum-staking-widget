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
import { useForm, FormProvider } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  useEthereumBalance,
  useIsSmartAccount,
  useWstethBalance,
  useMaxGasPrice,
  BALANCE_PADDING_L2,
  useDappStatus,
} from 'modules/web3';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import {
  useQueryParamsAmountForm,
  useQueryParamsReferralForm,
} from 'shared/hooks/use-query-values-form';
import { minBN } from 'utils/bn';

import { useL2FastStake } from './hooks/use-fast-stake';
import { useFastStakeLiquidity } from './hooks/use-fast-liquidity';
import { useL2StakeState } from './hooks/use-l2-stake-state';

import {
  L2StakeFormValidationResolver,
  useL2StakeFormValidationContext,
} from './validation';

import type {
  L2StakeFormDataContextValue,
  L2StakeFormInputType,
  L2StakeFormNetworkData,
  L2StakeFormValidationContext,
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
  const {
    data: wstethBalance,
    refetch: updateWstethBalance,
    isLoading: isWstethBalanceLoading,
  } = useWstethBalance();
  const { isSmartAccount, isLoading: isSmartAccountLoading } =
    useIsSmartAccount();
  const gasLimit = useFastStakeGasLimit();
  const {
    data: fastStakeLiquidity,
    isLoading: isFastStakeLiquidityLoading,
    refetch: refetchFastStakeLiquidity,
  } = useFastStakeLiquidity();
  const { maxGasPrice, isLoading: isMaxGasPriceLoading } = useMaxGasPrice();

  const gasCost = useMemo(
    () => (gasLimit && maxGasPrice ? gasLimit * maxGasPrice : undefined),
    [gasLimit, maxGasPrice],
  );
  const {
    data: etherBalance,
    refetch: updateEtherBalance,
    isLoading: isEtherBalanceLoading,
  } = useEthereumBalance();

  const stakeableEther = useMemo(() => {
    if (etherBalance === undefined) return undefined;

    return minBN(etherBalance, fastStakeLiquidity?.eth);
  }, [etherBalance, fastStakeLiquidity?.eth]);

  const fastStakeLiquidityEth = fastStakeLiquidity?.eth;

  const maxAmount = useTokenMaxAmount({
    balance: etherBalance,
    limit: fastStakeLiquidity?.eth,
    isPadded: !isSmartAccount,
    padding: BALANCE_PADDING_L2,
    gasLimit: gasLimit,
    isLoading: isSmartAccountLoading,
  });

  const revalidate = useCallback(async () => {
    await Promise.allSettled([
      updateWstethBalance(),
      updateEtherBalance(),
      refetchFastStakeLiquidity(),
    ]);
  }, [updateWstethBalance, updateEtherBalance, refetchFastStakeLiquidity]);

  const loading = useMemo(
    () => ({
      isWstethBalanceLoading,
      isSmartAccountLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isFastStakeLiquidityLoading,
      isStakeableEtherLoading:
        isFastStakeLiquidityLoading || isEtherBalanceLoading,
    }),
    [
      isWstethBalanceLoading,
      isSmartAccountLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isFastStakeLiquidityLoading,
    ],
  );

  return {
    wstethBalance,
    etherBalance,
    fastStakeLiquidityEth,
    stakeableEther,
    isSmartAccount,
    gasCost,
    gasLimit,
    maxAmount,
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
  const validationContextPromise = useL2StakeFormValidationContext(networkData);
  const l2StakeState = useL2StakeState();
  const trackStakeEvent = useTrackStakeEvent('fast_stake_more_liquidity');

  const formObject = useForm<
    L2StakeFormInputType,
    Promise<L2StakeFormValidationContext>
  >({
    defaultValues: {
      amount: null,
      referral: null,
    },
    context: validationContextPromise,
    resolver: L2StakeFormValidationResolver,
    mode: 'onChange',
    disabled: !l2StakeState.isEnabled,
  });
  const { setValue } = formObject;
  useQueryParamsReferralForm<L2StakeFormInputType>({ setValue });
  useQueryParamsAmountForm<L2StakeFormInputType>({ setValue });

  const { retryEvent, retryFire } = useFormControllerRetry();

  const stake = useL2FastStake({
    onConfirm: networkData.revalidate,
    onRetry: retryFire,
  });

  const [amount] = formObject.watch(['amount']);

  useEffect(() => {
    if (
      networkData.etherBalance !== undefined &&
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
        amount <= networkData.etherBalance
      ) {
        trackStakeEvent();
      }
    }
  }, [
    networkData.etherBalance,
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
      }),
      [retryEvent, stake],
    );

  const l2StakeFormDataContextValue: L2StakeFormDataContextValue = useMemo(
    () => ({
      stakeableEther: networkData.stakeableEther,
      maxAmount: networkData.maxAmount,
      gasCost: networkData.gasCost,
      loading: networkData.loading,
    }),
    [
      networkData.maxAmount,
      networkData.stakeableEther,
      networkData.gasCost,
      networkData.loading,
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
