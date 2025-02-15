import {
  ChangeEvent,
  ComponentProps,
  forwardRef,
  MouseEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { formatEther, parseEther, maxUint256 } from 'viem';

import { Input } from '@lidofinance/lido-ui';

import { InputDecoratorMaxButton } from './input-decorator-max-button';
import { InputDecoratorLocked } from './input-decorator-locked';
import { InputStyle } from './styles';

type InputAmountProps = {
  onChange?: (value: bigint | null) => void;
  value?: bigint | null;
  onMaxClick?: (event: MouseEvent<HTMLButtonElement>, maxValue: bigint) => void;
  maxValue?: bigint;
  isLocked?: boolean;
} & Omit<ComponentProps<typeof Input>, 'onChange' | 'value'>;

const parseEtherSafe = (value: string) => {
  try {
    return parseEther(value);
  } catch {
    return null;
  }
};

export const InputAmount = forwardRef<HTMLInputElement, InputAmountProps>(
  (
    {
      onChange,
      value,
      onMaxClick,
      rightDecorator,
      isLocked,
      maxValue,
      placeholder = '0',
      ...props
    },
    ref,
  ) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const defaultValue = useMemo(() => (value ? formatEther(value) : ''), []);

    const lastInputValue = useRef(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(ref, () => inputRef.current!, []);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        // will accumulate changes without committing to dom
        let currentValue = e.currentTarget.value;
        const immutableValue = e.currentTarget.value;
        const caretPosition = e.currentTarget.selectionStart ?? 0;

        currentValue = currentValue.trim();

        // Support for devices where inputMode="decimal" showing keyboard with comma as decimal delimiter
        if (currentValue.includes(',')) {
          currentValue = currentValue.replaceAll(',', '.');
        }

        // delete negative sign
        if (currentValue.includes('-')) {
          currentValue = currentValue.replaceAll('-', '');
        }

        // Prepend zero when user types just a dot symbol for "0."
        if (currentValue === '.') {
          currentValue = '0.';
        }

        if (currentValue === '') {
          onChange?.(null);
        } else {
          const value = parseEtherSafe(currentValue);
          // The check !value is not suitable because !value returns true for 0n.
          if (value == null) {
            // invalid value, so we rollback to last valid value
            const rollbackCaretPosition =
              caretPosition -
              Math.min(
                e.currentTarget.value.length - lastInputValue.current.length,
              );
            // rollback value (caret moves to end)
            e.currentTarget.value = lastInputValue.current;
            // rollback caret
            e.currentTarget.setSelectionRange(
              rollbackCaretPosition,
              rollbackCaretPosition,
            );
            return;
          }

          const cappedValue = value > maxUint256 ? maxUint256 : value;
          if (value > maxUint256) {
            currentValue = formatEther(maxUint256);
          }
          onChange?.(cappedValue);
        }

        // commit change to dom
        e.currentTarget.value = currentValue;
        // if there is a diff due to soft change, adjust caret to remain in same place
        if (currentValue != immutableValue) {
          const rollbackCaretPosition =
            caretPosition -
            Math.min(immutableValue.length - currentValue.length);
          e.currentTarget.setSelectionRange(
            rollbackCaretPosition,
            rollbackCaretPosition,
          );
        }
        lastInputValue.current = currentValue;
      },
      [onChange],
    );

    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;
      // The check !value is not suitable because !value returns true for 0n.
      if (value == null) {
        input.value = '';
      } else {
        const parsedValue = parseEtherSafe(input.value);
        // only change string state if casted values differ
        // this allows user to enter 0.100 without immediate change to 0.1
        if (parsedValue !== value) {
          input.value = formatEther(value);
          // prevents rollback to incorrect value in onChange
          lastInputValue.current = input.value;
        }
      }
    }, [value]);

    const handleClickMax =
      onChange && maxValue
        ? (event: MouseEvent<HTMLButtonElement>) => {
            onChange(maxValue);
            onMaxClick?.(event, maxValue);
          }
        : undefined;

    return (
      <InputStyle
        {...props}
        placeholder={placeholder}
        rightDecorator={
          rightDecorator ?? (
            <>
              <InputDecoratorMaxButton
                onClick={handleClickMax}
                disabled={!handleClickMax || props.disabled}
              />
              {isLocked ? <InputDecoratorLocked /> : undefined}
            </>
          )
        }
        inputMode="decimal"
        defaultValue={defaultValue}
        onChange={handleChange}
        ref={inputRef}
      />
    );
  },
);
