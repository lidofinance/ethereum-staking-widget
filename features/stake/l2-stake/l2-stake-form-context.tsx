import {
  FC,
  PropsWithChildren,
  useMemo,
  createContext,
  useContext,
  useCallback,
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
} from 'modules/web3';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';

import {
  L2StakeFormValidationResolver,
  useL2StakeFormValidationContext,
} from './validation';

// import { useStake } from '../use-stake';

import {
  useQueryParamsAmountForm,
  useQueryParamsReferralForm,
} from 'shared/hooks/use-query-values-form';
import type {
  L2StakeFormDataContextValue,
  L2StakeFormInputType,
  L2StakeFormNetworkData,
  L2StakeFormValidationContext,
} from './types';
import { useFastStakeLiquidity } from './hooks/use-fast-liquidity';
import { minBN } from 'utils/bn';

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
  const networkData = useL2StakeFormNetworkData();
  const validationContextPromise = useL2StakeFormValidationContext(networkData);

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
  });
  const { setValue } = formObject;
  useQueryParamsReferralForm<L2StakeFormInputType>({ setValue });
  useQueryParamsAmountForm<L2StakeFormInputType>({ setValue });

  const {
    retryEvent,
    //retryFire
  } = useFormControllerRetry();

  //   const stake = useStake({
  //     //onConfirm: networkData.revalidate,
  //     onRetry: retryFire,
  //   });

  const formControllerValue: FormControllerContextValueType<L2StakeFormInputType> =
    useMemo(
      () => ({
        onSubmit: () => {
          return Promise.resolve(true);
        },
        retryEvent,
      }),
      [retryEvent],
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
