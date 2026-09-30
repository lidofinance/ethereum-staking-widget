import {
  FC,
  PropsWithChildren,
  useMemo,
  createContext,
  useContext,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import invariant from 'tiny-invariant';

// import {
//   useEthereumBalance,
//   useIsSmartAccount,
//   //   BALANCE_PADDING,
//   useWstethBalance,
// } from 'modules/web3';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
// import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
// import { useStakingLimitInfo } from 'shared/hooks/useStakingLimitInfo';
// import { useIsSmartAccount, useMaxGasPrice } from 'modules/web3';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';

// import {
//   type StakeFormDataContextValue,
//   type StakeFormInput,
//   type StakeFormNetworkData,
// } from './types';
// import {
//   stakeFormValidationResolver,
//   useStakeFormValidationContext,
// } from './validation';

// import { useStake } from '../use-stake';
// import { useStethSubmitGasLimit } from '../hooks';
import {
  useQueryParamsAmountForm,
  useQueryParamsReferralForm,
} from 'shared/hooks/use-query-values-form';
import { L2StakeFormDataContextValue, L2StakeFormInputType } from './types';

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

// const useL2StakeFormNetworkData = ():  => {
//   const {
//     data: wstethBalance,
//     refetch: updateWstethBalance,
//     isLoading: isWstethBalanceLoading,
//   } = useWstethBalance();
//   const { isSmartAccount, isLoading: isSmartAccountLoading } =
//     useIsSmartAccount();
//   //const gasLimit = useStethSubmitGasLimit();
//   const { maxGasPrice, isLoading: isMaxGasPriceLoading } = useMaxGasPrice();

//   const gasCost = useMemo(
//     () => (gasLimit && maxGasPrice ? gasLimit * maxGasPrice : undefined),
//     [gasLimit, maxGasPrice],
//   );

//   const {
//     data: etherBalance,
//     refetch: updateEtherBalance,
//     isLoading: isEtherBalanceLoading,
//   } = useEthereumBalance();

//   const {
//     data: stakingLimitInfo,
//     refetch: refetchStakeLimit,
//     isLoading: isStakingLimitIsLoading,
//   } = useStakingLimitInfo();

//   const stakeableEther = useMemo(() => {
//     if (etherBalance === undefined || !stakingLimitInfo) return undefined;
//     if (etherBalance && stakingLimitInfo.isStakingLimitSet) {
//       return etherBalance < stakingLimitInfo.currentStakeLimit
//         ? etherBalance
//         : stakingLimitInfo.currentStakeLimit;
//     }
//     return etherBalance;
//   }, [etherBalance, stakingLimitInfo]);

//   const maxAmount = useTokenMaxAmount({
//     balance: etherBalance,
//     limit: stakingLimitInfo?.currentStakeLimit,
//     isPadded: !isSmartAccount,
//     gasLimit: gasLimit,
//     padding: BALANCE_PADDING,
//     isLoading: isSmartAccountLoading,
//   });

//   const revalidate = useCallback(async () => {
//     await Promise.allSettled([
//       updateWstethBalance(),
//       updateEtherBalance(),
//       refetchStakeLimit(),
//     ]);
//   }, [updateWstethBalance, updateEtherBalance, refetchStakeLimit]);

//   const loading = useMemo(
//     () => ({
//       isWstethBalanceLoading,
//       isSmartAccountLoading,
//       isMaxGasPriceLoading,
//       isEtherBalanceLoading,
//       isStakeableEtherLoading: isStakingLimitIsLoading || isEtherBalanceLoading,
//     }),
//     [
//       isWstethBalanceLoading,
//       isSmartAccountLoading,
//       isMaxGasPriceLoading,
//       isEtherBalanceLoading,
//       isStakingLimitIsLoading,
//     ],
//   );

//   return {
//     wstethBalance,
//     etherBalance,
//     isSmartAccount,
//     stakeableEther,
//     stakingLimitInfo,
//     gasCost,
//     gasLimit,
//     maxAmount,
//     loading,
//     revalidate,
//   };
// };

//
// Data provider
//
export const L2StakeFormProvider: FC<PropsWithChildren> = ({ children }) => {
  //   const networkData = useStakeFormNetworkData();
  //   const validationContextPromise = useStakeFormValidationContext(networkData);

  const formObject = useForm<L2StakeFormInputType>({
    defaultValues: {
      amount: null,
      referral: null,
    },
    //context: validationContextPromise,
    // resolver: null,
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
      stakeableEther: undefined,
    }),
    [],
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
