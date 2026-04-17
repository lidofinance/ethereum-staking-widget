import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Path, PathValue, UseFormSetValue } from 'react-hook-form';
import { parseEther } from 'viem';

export const useReferralQueryValue = () => {
  const { isReady, query } = useRouter();
  const { ref } = query;

  if (!isReady || typeof ref !== 'string') {
    return null;
  }

  return ref;
};

type UseQueryParamsReferralFormArgs<T extends { referral: string | null }> = {
  setValue: UseFormSetValue<T>;
};

export const useQueryParamsReferralForm = <
  T extends { referral: string | null },
>({
  setValue,
}: UseQueryParamsReferralFormArgs<T>) => {
  const referral = useReferralQueryValue();

  useEffect(() => {
    if (!referral) return;
    try {
      setValue('referral' as Path<T>, referral as PathValue<T, Path<T>>);
    } catch (error) {
      console.warn('Error setting referral value from query params', error);
    }
  }, [referral, setValue]);
};

type UseQueryParamsAmountFormArgs<T extends { amount: bigint | null }> = {
  setValue: UseFormSetValue<T>;
};

export const useQueryParamsAmountForm = <T extends { amount: bigint | null }>({
  setValue,
}: UseQueryParamsAmountFormArgs<T>) => {
  const { isReady, query, pathname, replace } = useRouter();

  useEffect(() => {
    if (!isReady) return;
    try {
      const { amount, ...rest } = query;

      if (typeof amount === 'string') {
        void replace({ pathname, query: rest });
        const amountBigInt = parseEther(amount);
        setValue('amount' as Path<T>, amountBigInt as PathValue<T, Path<T>>);
      }
    } catch (error) {
      console.warn('Error setting amount value from query params', error);
    }
  }, [isReady, pathname, query, replace, setValue]);
};
