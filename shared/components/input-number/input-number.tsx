import { useCallback } from 'react';
import { Input } from '@lidofinance/lido-ui';

type InputNumberProps = React.ComponentProps<typeof Input>;

export const InputNumber = ({ onChange, ...props }: InputNumberProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget.value === '.') {
        e.currentTarget.value = '0.';
        onChange?.(e);
        return;
      }

      if (isNaN(Number(e.target.value))) {
        return;
      }

      onChange?.(e);
    },
    [onChange],
  );
  return <Input {...props} onChange={handleChange} />;
};
