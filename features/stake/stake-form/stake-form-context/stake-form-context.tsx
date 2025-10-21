import {
  FC,
  PropsWithChildren,
  useMemo,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  useEthereumBalance,
  useStethBalance,
  BALANCE_PADDING,
} from 'modules/web3';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { useStakingLimitInfo } from 'shared/hooks/useStakingLimitInfo';
import { useIsSmartAccount, useMaxGasPrice } from 'modules/web3';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';

import {
  type StakeFormDataContextValue,
  type StakeFormInput,
  type StakeFormNetworkData,
} from './types';
import {
  stakeFormValidationResolver,
  useStakeFormValidationContext,
} from './validation';

import { useStake } from '../use-stake';
import { useStethSubmitGasLimit } from '../hooks';
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
  const gasLimit = useStethSubmitGasLimit();
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

  const {
    data: stakingLimitInfo,
    refetch: refetchStakeLimit,
    isLoading: isStakingLimitIsLoading,
  } = useStakingLimitInfo();

  const stakeableEther = useMemo(() => {
    if (etherBalance === undefined || !stakingLimitInfo) return undefined;
    if (etherBalance && stakingLimitInfo.isStakingLimitSet) {
      return etherBalance < stakingLimitInfo.currentStakeLimit
        ? etherBalance
        : stakingLimitInfo.currentStakeLimit;
    }
    return etherBalance;
  }, [etherBalance, stakingLimitInfo]);

  const maxAmount = useTokenMaxAmount({
    balance: etherBalance,
    limit: stakingLimitInfo?.currentStakeLimit,
    isPadded: !isSmartAccount,
    gasLimit: gasLimit,
    padding: BALANCE_PADDING,
    isLoading: isSmartAccountLoading,
  });

  const revalidate = useCallback(async () => {
    await Promise.allSettled([
      updateStethBalance(),
      updateEtherBalance(),
      refetchStakeLimit(),
    ]);
  }, [updateStethBalance, updateEtherBalance, refetchStakeLimit]);

  const loading = useMemo(
    () => ({
      isStethBalanceLoading,
      isSmartAccountLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isStakeableEtherLoading: isStakingLimitIsLoading || isEtherBalanceLoading,
    }),
    [
      isStethBalanceLoading,
      isSmartAccountLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isStakingLimitIsLoading,
    ],
  );

  return {
    stethBalance,
    etherBalance,
    isSmartAccount,
    stakeableEther,
    stakingLimitInfo,
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
export const StakeFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const networkData = useStakeFormNetworkData();
  const validationContextPromise = useStakeFormValidationContext(networkData);

  const formObject = useForm<StakeFormInput>({
    defaultValues: {
      amount: null,
      referral: null,
    },
    context: validationContextPromise,
    resolver: stakeFormValidationResolver,
    mode: 'onChange',
  });
  const { setValue } = formObject;
  useQueryParamsReferralForm<StakeFormInput>({ setValue });
  useQueryParamsAmountForm<StakeFormInput>({ setValue });

  const { retryEvent, retryFire } = useFormControllerRetry();

  const stake = useStake({
    onConfirm: networkData.revalidate,
    onRetry: retryFire,
  });

  const formControllerValue: FormControllerContextValueType<StakeFormInput> =
    useMemo(
      () => ({
        onSubmit: stake,
        retryEvent,
      }),
      [stake, retryEvent],
    );

  return (
    <FormProvider {...formObject}>
      <StakeFormDataContext.Provider value={networkData}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </StakeFormDataContext.Provider>
    </FormProvider>
  );
};
