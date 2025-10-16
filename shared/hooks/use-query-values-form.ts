import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Path, PathValue, UseFormSetValue } from 'react-hook-form';
import { parseEther } from 'viem';

type useQueryReferralFormArgs<T extends { referral: string | null }> = {
  setValue: UseFormSetValue<T>;
};

export const useQueryReferralForm = <T extends { referral: string | null }>({
  setValue,
}: useQueryReferralFormArgs<T>) => {
  const { isReady, query, pathname, replace } = useRouter();
  useEffect(() => {
    if (!isReady) return;
    try {
      const { ref } = query;

      if (typeof ref === 'string') {
        setValue('referral' as Path<T>, ref as PathValue<T, Path<T>>);
      }
    } catch {
      //noop
    }
  }, [isReady, pathname, query, replace, setValue]);
};

type useQueryAmountFormArgs<T extends { amount: bigint | null }> = {
  setValue: UseFormSetValue<T>;
};

export const useQueryAmountForm = <T extends { amount: bigint | null }>({
  setValue,
}: useQueryAmountFormArgs<T>) => {
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
    } catch {
      //noop
    }
  }, [isReady, pathname, query, replace, setValue]);
};
