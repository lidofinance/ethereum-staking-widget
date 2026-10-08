import {
  FC,
  PropsWithChildren,
  useMemo,
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  useEthereumBalance,
  useStethBalance,
  useWethBalance,
  BALANCE_PADDING,
} from 'modules/web3';

import {
  FormControllerContext,
  FormControllerContextValueType,
  passFormState,
  recoverFormState,
} from 'shared/hook-form/form-controller';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { useStakingLimitInfo } from 'shared/hooks/useStakingLimitInfo';
import { useIsSmartAccount, useMaxGasPrice } from 'modules/web3';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import { WETH_UNWRAP_GAS_LIMIT } from 'consts/tx';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import { minBN } from 'utils/bn';

import {
  type StakeFormDataContextValue,
  type StakeFormInput,
  type StakeFormNetworkData,
  type StakeFormValidationContextByToken,
} from './types';
import {
  stakeFormValidationResolver,
  useStakeFormValidationContext,
} from './validation';

import { useStake } from '../use-stake';
import { useStethSubmitGasLimit } from '../hooks';
import { useWethUnwrap } from '../hooks/use-weth-unwrap';
import {
  useQueryParamsAmountForm,
  useQueryParamsReferralForm,
} from 'shared/hooks/use-query-values-form';

//
// Data context
//
const StakeFormDataContext = createContext<StakeFormDataContextValue | null>(
  null,
);
StakeFormDataContext.displayName = 'StakeFormDataContext';

export const useStakeFormData = () => {
  const value = useContext(StakeFormDataContext);
  invariant(
    value,
    'useStakeFormData was used outside the StakeFormDataContext provider',
  );
  return value;
};

const useStakeFormNetworkData = (): StakeFormNetworkData => {
  const {
    data: stethBalance,
    refetch: updateStethBalance,
    isLoading: isStethBalanceLoading,
  } = useStethBalance();
  const { isSmartAccount, isLoading: isSmartAccountLoading } =
    useIsSmartAccount();
  const gasLimitEth = useStethSubmitGasLimit();
  // unwrap + submit; the unwrap is a fixed-cost WETH9 call
  const gasLimitWeth = gasLimitEth + WETH_UNWRAP_GAS_LIMIT;
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

  const { isWethSupported } = useWethUnwrap();
  const {
    data: wethBalance,
    refetch: updateWethBalance,
    isLoading: isWethBalanceLoading,
  } = useWethBalance();

  const {
    data: stakingLimitInfo,
    refetch: refetchStakeLimit,
    isLoading: isStakingLimitIsLoading,
  } = useStakingLimitInfo();

  const stakeableEther = useMemo(() => {
    if (etherBalance === undefined || !stakingLimitInfo) return undefined;
    if (etherBalance && stakingLimitInfo.isStakingLimitSet) {
      return minBN(etherBalance, stakingLimitInfo.currentStakeLimit);
    }
    return etherBalance;
  }, [etherBalance, stakingLimitInfo]);

  const stakeableWeth = useMemo(() => {
    if (wethBalance === undefined || !stakingLimitInfo) return undefined;
    if (wethBalance && stakingLimitInfo.isStakingLimitSet) {
      return minBN(wethBalance, stakingLimitInfo.currentStakeLimit);
    }
    return wethBalance;
  }, [wethBalance, stakingLimitInfo]);

  const maxAmountEth = useTokenMaxAmount({
    balance: etherBalance,
    limit: stakingLimitInfo?.currentStakeLimit,
    isPadded: !isSmartAccount,
    gasLimit: gasLimitEth,
    padding: BALANCE_PADDING,
    isLoading: isSmartAccountLoading,
  });

  // gas is paid from the ETH balance, so the whole WETH balance can be staked
  const maxAmountWeth = useTokenMaxAmount({
    balance: wethBalance,
    limit: stakingLimitInfo?.currentStakeLimit,
  });

  const revalidate = useCallback(async () => {
    await Promise.allSettled([
      updateStethBalance(),
      updateEtherBalance(),
      updateWethBalance(),
      refetchStakeLimit(),
    ]);
  }, [
    updateStethBalance,
    updateEtherBalance,
    updateWethBalance,
    refetchStakeLimit,
  ]);

  const loading = useMemo(
    () => ({
      isStethBalanceLoading,
      isSmartAccountLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isWethBalanceLoading,
      isStakeableEtherLoading: isStakingLimitIsLoading || isEtherBalanceLoading,
      isStakeableWethLoading: isStakingLimitIsLoading || isWethBalanceLoading,
    }),
    [
      isStethBalanceLoading,
      isSmartAccountLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isWethBalanceLoading,
      isStakingLimitIsLoading,
    ],
  );

  return {
    stethBalance,
    etherBalance,
    wethBalance,
    isWethSupported,
    isSmartAccount,
    stakeableEther,
    stakeableWeth,
    stakingLimitInfo,
    gasLimitEth,
    gasLimitWeth,
    gasCostEth,
    gasCostWeth,
    maxAmountEth,
    maxAmountWeth,
    loading,
    revalidate,
  };
};

//
// Data provider
//
export const StakeFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const networkData = useStakeFormNetworkData();
  const validationContextByToken = useStakeFormValidationContext(networkData);

  const formObject = useForm<StakeFormInput, StakeFormValidationContextByToken>(
    {
      defaultValues: {
        amount: recoverFormState('stake').amount ?? null,
        token: TOKENS_TO_STAKE.ETH,
        referral: recoverFormState('stake').referral ?? null,
      },
      context: validationContextByToken,
      resolver: stakeFormValidationResolver,
      mode: 'onChange',
    },
  );
  const { setValue } = formObject;
  useQueryParamsReferralForm<StakeFormInput>({ setValue });
  useQueryParamsAmountForm<StakeFormInput>({ setValue });

  const { retryEvent, retryFire } = useFormControllerRetry();

  const token = useWatch({ control: formObject.control, name: 'token' });
  const { amount } = useWatch({ control: formObject.control });
  const isWeth = token === TOKENS_TO_STAKE.WETH;

  // WETH may be unavailable on the connected chain (or after a chain switch).
  // The selector is hidden there, so the token must be normalized here
  useEffect(() => {
    if (!networkData.isWethSupported && token !== TOKENS_TO_STAKE.ETH) {
      setValue('token', TOKENS_TO_STAKE.ETH, { shouldValidate: true });
    }
  }, [networkData.isWethSupported, token, setValue]);

  // communicate the amount between L1 and L2 staking forms

  useEffect(() => {
    passFormState('stake', { amount });
  }, [amount]);

  // after a separate unwrap the funds are ETH: keep the amount, retry as ETH
  const onUnwrapped = useCallback(() => {
    setValue('token', TOKENS_TO_STAKE.ETH, { shouldValidate: true });
  }, [setValue]);

  const stake = useStake({
    onConfirm: networkData.revalidate,
    onRetry: retryFire,
    onUnwrapped,
  });

  const formControllerValue: FormControllerContextValueType<StakeFormInput> =
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
      [stake, retryEvent, formObject],
    );

  const value: StakeFormDataContextValue = useMemo(
    () => ({
      ...networkData,
      token,
      isWeth,
      stakeableAmount: isWeth
        ? networkData.stakeableWeth
        : networkData.stakeableEther,
      isStakeableAmountLoading: isWeth
        ? networkData.loading.isStakeableWethLoading
        : networkData.loading.isStakeableEtherLoading,
      gasCost: isWeth ? networkData.gasCostWeth : networkData.gasCostEth,
      maxAmount: isWeth ? networkData.maxAmountWeth : networkData.maxAmountEth,
    }),
    [networkData, token, isWeth],
  );

  return (
    <FormProvider {...formObject}>
      <StakeFormDataContext.Provider value={value}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </StakeFormDataContext.Provider>
    </FormProvider>
  );
};
