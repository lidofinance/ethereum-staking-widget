import { useState, type ChangeEvent } from 'react';
import {
  useController,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';

const parseAmount = (text: string, decimals: number) => {
  if (!text) return null;
  try {
    return parseUnits(text, decimals);
  } catch {
    return null;
  }
};

const formatAmount = (amount: bigint | null, decimals: number) =>
  amount === null ? '' : formatUnits(amount, decimals);

type UseAmountFieldArgs<T extends FieldValues> = {
  control: Control<T>;
  /** a `bigint | null` field */
  name: FieldPathByValue<T, bigint | null>;
  decimals?: number;
};

/**
 * Binds a text input (e.g. lido-app-ui RichInput) to a `bigint | null`
 * form field. The typed text is kept as is, so "1." or "0.10" survive while
 * the form holds the bigint; an outside change (reset, Max, query param)
 * replaces the text. Spread the result onto the input; `error` is the
 * field's message, for inputs that show one (RichInput's `error`).
 */
export const useAmountField = <T extends FieldValues>({
  control,
  name,
  decimals = 18,
}: UseAmountFieldArgs<T>) => {
  const { field, fieldState } = useController({ control, name });
  const amount = field.value as bigint | null;

  const [text, setText] = useState(() => formatAmount(amount, decimals));
  // the amount changed from outside: show it
  if (parseAmount(text, decimals) !== amount) {
    setText(formatAmount(amount, decimals));
  }

  return {
    ref: field.ref,
    name: field.name,
    onBlur: field.onBlur,
    // the field's own error, from its controller (re-renders on it alone).
    // Only errors with text: an empty one (e.g. no amount yet) blocks
    // submit but does not mark the field
    error: fieldState.error?.message || undefined,
    value: text,
    decimals,
    inputMode: 'decimal' as const,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      setText(event.target.value);
      field.onChange(parseAmount(event.target.value, decimals));
    },
  };
};
