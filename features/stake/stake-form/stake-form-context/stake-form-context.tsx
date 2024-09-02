import invariant from 'tiny-invariant';
import {
  FC,
  PropsWithChildren,
  useMemo,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/router';

import { useEthereumBalance, useSTETHBalance } from '@lido-sdk/react';
import { parseEther } from '@ethersproject/units';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { useStakingLimitInfo } from 'shared/hooks/useStakingLimitInfo';
import { useMaxGasPrice } from 'shared/hooks';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';

import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { config } from 'config';

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
    update: updateStethBalance,
    initialLoading: isStethBalanceLoading,
  } = useSTETHBalance(STRATEGY_LAZY);
  const { isMultisig, isLoading: isMultisigLoading } = useIsMultisig();
  const gasLimit = useStethSubmitGasLimit();
  const { maxGasPrice, initialLoading: isMaxGasPriceLoading } =
    useMaxGasPrice();

  const gasCost = useMemo(
    () => (gasLimit && maxGasPrice ? gasLimit.mul(maxGasPrice) : undefined),
    [gasLimit, maxGasPrice],
  );

  const {
    data: etherBalance,
    update: updateEtherBalance,
    initialLoading: isEtherBalanceLoading,
  } = useEthereumBalance(undefined, STRATEGY_LAZY);
  const {
    data: stakingLimitInfo,
    mutate: mutateStakeLimit,
    initialLoading: isStakingLimitLoading,
  } = useStakingLimitInfo();

  const stakeableEther = useMemo(() => {
    if (!etherBalance || !stakingLimitInfo) return undefined;
    if (etherBalance && stakingLimitInfo.isStakingLimitSet) {
      return etherBalance.lt(stakingLimitInfo.currentStakeLimit)
        ? etherBalance
        : stakingLimitInfo.currentStakeLimit;
    }
    return etherBalance;
  }, [etherBalance, stakingLimitInfo]);

  const maxAmount = useTokenMaxAmount({
    balance: etherBalance,
    limit: stakingLimitInfo?.currentStakeLimit,
    isPadded: !isMultisig,
    gasLimit: gasLimit,
    padding: config.BALANCE_PADDING,
    isLoading: isMultisigLoading,
  });

  const revalidate = useCallback(async () => {
    await Promise.allSettled([
      updateStethBalance(),
      updateEtherBalance(),
      mutateStakeLimit(stakingLimitInfo),
    ]);
  }, [
    updateStethBalance,
    updateEtherBalance,
    mutateStakeLimit,
    stakingLimitInfo,
  ]);

  const loading = useMemo(
    () => ({
      isStethBalanceLoading,
      isMultisigLoading,
      isMaxGasPriceLoading,
      isEtherBalanceLoading,
      isStakeableEtherLoading: isStakingLimitLoading || isEtherBalanceLoading,
    }),
    [
      isEtherBalanceLoading,
      isMaxGasPriceLoading,
      isMultisigLoading,
      isStethBalanceLoading,
      isStakingLimitLoading,
    ],
  );

  return {
    stethBalance,
    etherBalance,
    isMultisig: isMultisigLoading ? undefined : isMultisig,
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

  // consumes amount query param
  // SSG safe
  const { isReady, query, pathname, replace } = useRouter();
  useEffect(() => {
    if (!isReady) return;
    try {
      const { amount, ref, ...rest } = query;

      if (typeof ref === 'string') {
        setValue('referral', ref);
      }
      if (typeof amount === 'string') {
        void replace({ pathname, query: rest });
        const amountBN = parseEther(amount);
        setValue('amount', amountBN);
      }
    } catch {
      //noop
    }
  }, [isReady, pathname, query, replace, setValue]);

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
