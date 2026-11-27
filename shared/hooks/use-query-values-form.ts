import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type {
  FieldPathByValue,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
  UseFormSetValue,
} from 'react-hook-form';
import { parseEther } from 'viem';

export const useReferralQueryValue = () => {
  const { isReady, query } = useRouter();
  const { ref } = query;

  if (!isReady || typeof ref !== 'string') {
    return null;
  }

  return ref;
};

/**
 * fills the referral field from `?ref=`; `field` is a `string | null`
 * field, `referral` by default
 */
export const useQueryParamsReferralForm = <T extends FieldValues>(
  { setValue }: Pick<UseFormReturn<T>, 'setValue'>,
  field = 'referral' as FieldPathByValue<T, string | null>,
) => {
  const referral = useReferralQueryValue();

  useEffect(() => {
    if (!referral) return;
    try {
      setValue(field, referral as PathValue<T, typeof field>);
    } catch (error) {
      console.warn('Error setting referral value from query params', error);
    }
  }, [referral, setValue, field]);
};

type UseQueryParamsTokenFormArgs<T extends { token: string }> = {
  setValue: UseFormSetValue<T>;
  // Lowercase token key from the URL -> token value of the form
  tokens: Readonly<Record<string, T['token']>>;
};

export const useQueryParamsTokenForm = <T extends { token: string }>({
  setValue,
  tokens,
}: UseQueryParamsTokenFormArgs<T>) => {
  const { isReady, query, pathname, replace } = useRouter();

  useEffect(() => {
    if (!isReady) return;
    try {
      const { token, ...rest } = query;

      if (typeof token === 'string') {
        // Remove the param, so a page reload keeps the user's own choice.
        // Shallow: the page data does not change. A cancelled route is not an error.
        replace({ pathname, query: rest }, undefined, {
          shallow: true,
          scroll: false,
        }).catch(() => {});
        // Own keys only: the maps are plain objects, so a name like
        // `constructor` would otherwise resolve through the prototype
        const key = token.toLowerCase();
        const formToken = Object.hasOwn(tokens, key) ? tokens[key] : undefined;
        if (typeof formToken === 'string') {
          setValue('token' as Path<T>, formToken as PathValue<T, Path<T>>);
        }
      }
    } catch (error) {
      console.warn('Error setting token value from query params', error);
    }
  }, [isReady, pathname, query, replace, setValue, tokens]);
};

/**
 * fills the amount field from `?amount=` (in ether), then drops the param;
 * `field` is a `bigint | null` field, `amount` by default
 */
export const useQueryParamsAmountForm = <T extends FieldValues>(
  { setValue }: Pick<UseFormReturn<T>, 'setValue'>,
  field = 'amount' as FieldPathByValue<T, bigint | null>,
) => {
  const { isReady, query, pathname, replace } = useRouter();

  useEffect(() => {
    if (!isReady) return;
    try {
      const { amount, ...rest } = query;

      if (typeof amount === 'string') {
        void replace({ pathname, query: rest });
        const amountBigInt = parseEther(amount);
        setValue(field, amountBigInt as PathValue<T, typeof field>);
      }
    } catch (error) {
      console.warn('Error setting amount value from query params', error);
    }
  }, [isReady, pathname, query, replace, setValue, field]);
};
