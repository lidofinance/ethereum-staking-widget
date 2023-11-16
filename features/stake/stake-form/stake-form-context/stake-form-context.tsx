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
import { Zero } from '@ethersproject/constants';
import { useEthereumBalance, useSTETHBalance } from '@lido-sdk/react';
import { parseEther } from '@ethersproject/units';
import { useRouter } from 'next/router';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useStakingLimitInfo } from 'shared/hooks/useStakingLimitInfo';
import { useMaxGasPrice } from 'shared/hooks';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

import { useStethSubmitGasLimit } from '../hooks';
import {
  stakeFormValidationResolver,
  useStakeFormValidationContext,
} from './validation';
import { useStake } from '../use-stake';
import {
  type StakeFormDataContextValue,
  type StakeFormInput,
  type StakeFormNetworkData,
} from './types';

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

export const useStakeFormNetworkData = (): StakeFormNetworkData => {
  const { update: updateStethBalance } = useSTETHBalance();
  const { isMultisig, isLoading: isMultisigLoading } = useIsMultisig();
  const gasLimit = useStethSubmitGasLimit();
  const maxGasFee = useMaxGasPrice();
  const gasCost = useMemo(
    () => (gasLimit && maxGasFee ? gasLimit.mul(maxGasFee) : undefined),
    [gasLimit, maxGasFee],
  );

  const { data: etherBalance, update: updateEtherBalance } = useEthereumBalance(
    undefined,
    STRATEGY_LAZY,
  );
  const { data: stakingLimitInfo, mutate: mutateStakeLimit } =
    useStakingLimitInfo();

  const stakeableEther = useMemo(() => {
    if (
      etherBalance &&
      stakingLimitInfo &&
      stakingLimitInfo.isStakingLimitSet
    ) {
      return etherBalance.lt(stakingLimitInfo.currentStakeLimit)
        ? etherBalance
        : stakingLimitInfo.currentStakeLimit;
    }
    return etherBalance;
  }, [etherBalance, stakingLimitInfo]);

  const maxAmount = useMemo(() => {
    if (stakingLimitInfo && etherBalance && !isMultisigLoading) {
      let maxEther = etherBalance;
      // if not multisig we have to wait for gasCost and subtract it
      if (!isMultisig) {
        if (gasCost) maxEther = maxEther.sub(gasCost);
        else return undefined;
      }

      if (maxEther.lt(Zero)) {
        maxEther = Zero;
      }
      return maxEther.lt(stakingLimitInfo.currentStakeLimit)
        ? maxEther
        : stakingLimitInfo.currentStakeLimit;
    }
    return undefined;
  }, [stakingLimitInfo, etherBalance, isMultisigLoading, isMultisig, gasCost]);

  const revalidate = useCallback(async () => {
    await Promise.all([
      updateStethBalance,
      updateEtherBalance,
      () => mutateStakeLimit(stakingLimitInfo),
    ]);
  }, [
    updateStethBalance,
    updateEtherBalance,
    mutateStakeLimit,
    stakingLimitInfo,
  ]);

  return {
    etherBalance,
    stakeableEther,
    stakingLimitInfo,
    gasCost,
    gasLimit,
    maxAmount,
    revalidate,
  };
};

//
// Data provider
//
export const StakeFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
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
  useEffect(() => {
    if (router.isReady) {
      const { amount, ref, ...rest } = router.query;
      if (typeof ref === 'string') {
        setValue('referral', ref);
      }
      if (typeof amount === 'string') {
        void router.replace({ pathname: router.pathname, query: rest });
        try {
          const amountBN = parseEther(amount);
          setValue('amount', amountBN);
        } catch {
          //noop
        }
      }
    }
  }, [router, setValue]);

  const stake = useStake({ onConfirm: networkData.revalidate });

  const formControllerValue: FormControllerContextValueType<StakeFormInput> =
    useMemo(() => ({ onSubmit: stake }), [stake]);

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
