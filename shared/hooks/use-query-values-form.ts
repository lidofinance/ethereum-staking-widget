import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Path, PathValue, UseFormSetValue } from 'react-hook-form';
import { parseEther } from 'viem';

export const useReferralQueryValue = () => {
  const [searchParams] = useSearchParams();
  return searchParams.get('ref');
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
  // setSearchParams only touches the query string — route params
  // (`/earn/dvv/deposit?amount=1`) stay in the path, untouched
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const amount = searchParams.get('amount');
    if (amount === null) return;
    try {
      const rest = new URLSearchParams(searchParams);
      rest.delete('amount');
      setSearchParams(rest, { replace: true });
      const amountBigInt = parseEther(amount);
      setValue('amount' as Path<T>, amountBigInt as PathValue<T, Path<T>>);
    } catch (error) {
      console.warn('Error setting amount value from query params', error);
    }
  }, [searchParams, setSearchParams, setValue]);
};
