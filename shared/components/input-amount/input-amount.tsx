import {
  ChangeEvent,
  ComponentProps,
  forwardRef,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { BigNumber } from 'ethers';

import { formatEther, parseEther } from '@ethersproject/units';
import { MaxUint256 } from '@ethersproject/constants';
import { Input } from '@lidofinance/lido-ui';

import { InputDecoratorMaxButton } from './input-decorator-max-button';
import { InputDecoratorLocked } from './input-decorator-locked';

type InputAmountProps = {
  onChange?: (value: BigNumber | null) => void;
  value?: BigNumber | null;
  onMaxClick?: (
    event: MouseEvent<HTMLButtonElement>,
    maxValue: BigNumber,
  ) => void;
  maxValue?: BigNumber;
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
    const [stringValue, setStringValue] = useState(() =>
      value ? formatEther(value) : '',
    );

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.trim();

        // Support for devices where inputMode="decimal" showing keyboard with comma as decimal delimiter
        if (e.currentTarget.value.includes(',')) {
          e.currentTarget.value = e.currentTarget.value.replaceAll(',', '.');
        }

        // delete negative sign
        if (e.currentTarget.value.includes('-')) {
          e.currentTarget.value = e.currentTarget.value.replaceAll('-', '');
        }

        // Prepend zero when user types just a dot symbol for "0."
        if (e.currentTarget.value === '.') {
          e.currentTarget.value = '0.';
        }

        // guards against non numbers (no matter overflow or whitespace)
        // empty whitespace is cast to 0, so not NaN
        if (isNaN(Number(e.currentTarget.value))) {
          return;
        }

        if (e.currentTarget.value === '') {
          onChange?.(null);
        }

        const value = parseEtherSafe(e.currentTarget.value);
        if (value) {
          const cappedValue = value.gt(MaxUint256) ? MaxUint256 : value;
          onChange?.(cappedValue);
        }

        // we set string value anyway to allow intermediate input
        setStringValue(e.currentTarget.value);
      },
      [onChange],
    );

    useEffect(() => {
      if (!value) setStringValue('');
      else {
        const parsedValue = parseEtherSafe(stringValue);
        // only change string state if casted values differ
        // this allows user to enter 0.100 without immediate change to 0.1
        if (!parsedValue || !parsedValue.eq(value)) {
          setStringValue(formatEther(value));
        }
      }
    }, [stringValue, value]);

    const handleClickMax =
      onChange && maxValue?.gt(0)
        ? (event: MouseEvent<HTMLButtonElement>) => {
            onChange(maxValue);
            onMaxClick?.(event, maxValue);
          }
        : undefined;

    return (
      <Input
        {...props}
        placeholder={placeholder}
        rightDecorator={
          rightDecorator ?? (
            <>
              <InputDecoratorMaxButton
                onClick={handleClickMax}
                disabled={!handleClickMax}
              />
              {isLocked ? <InputDecoratorLocked /> : undefined}
            </>
          )
        }
        inputMode="decimal"
        value={stringValue}
        onChange={handleChange}
        ref={ref}
      />
    );
  },
);
