import { forwardRef, useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { formatEther, parseEther } from '@ethersproject/units';
import { InputNumber } from '../input-number';
import { InputDecoratorMaxButton } from '../input-decorator-max-button';
import { InputDecoratorLocked } from '../input-decorator-locked';

type InputAmountProps = {
  onChange?: (value: BigNumber | null) => void;
  value?: BigNumber | null;
  maxValue?: BigNumber;
  isLocked?: boolean;
} & Omit<React.ComponentProps<typeof InputNumber>, 'onChange' | 'value'>;

const parseEtherSafe = (value: string) => {
  try {
    return parseEther(value);
  } catch {
    return null;
  }
};

// TODO: refactor to native input
export const InputAmount = forwardRef<HTMLInputElement, InputAmountProps>(
  ({ onChange, value, rightDecorator, isLocked, maxValue, ...props }, ref) => {
    const [stringValue, setStringValue] = useState(() =>
      value ? formatEther(value) : '',
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setStringValue(e.currentTarget.value);
        if (e.currentTarget.value.trim() === '') onChange?.(null);
        try {
          const value = parseEther(e.currentTarget.value);
          onChange?.(value);
        } catch {
          return;
        }
      },
      [onChange],
    );

    useEffect(() => {
      if (!value) setStringValue('');
      else {
        const parsedValue = parseEtherSafe(stringValue);
        if (!parsedValue || !parsedValue.eq(value)) {
          setStringValue(formatEther(value));
        }
      }
    }, [stringValue, value]);

    const handleClickMax =
      onChange && maxValue?.gt(0) ? () => onChange(maxValue) : undefined;

    return (
      <InputNumber
        {...props}
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
        value={stringValue}
        onChange={handleChange}
        ref={ref}
      />
    );
  },
);
