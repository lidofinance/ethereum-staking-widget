import { useController, useFormState, useFormContext } from 'react-hook-form';

import { Option, Eth, Steth, Wsteth, OptionValue } from '@lidofinance/lido-ui';
import { TokenWethIcon } from 'assets/earn';
import { TokenUsdcIcon, TokenUsdeIcon, TokenUsdtIcon } from 'assets/earn-v2';

import { getTokenSymbol, TokenSymbol } from 'utils/get-token-symbol';
import { isValidationErrorTypeValidate } from 'shared/hook-form/validation/validation-error';
import { SelectIconStyle } from './styles';

export type TokenOption = {
  label?: string;
  token: TokenSymbol;
};

const iconsMap: { [key in TokenSymbol]?: JSX.Element } = {
  ['ETH']: <Eth />,
  ['WETH']: <TokenWethIcon />,
  ['stETH']: <Steth />,
  ['wstETH']: <Wsteth />,
  ['USDC']: <TokenUsdcIcon width={24} height={24} />,
  ['USDT']: <TokenUsdtIcon width={24} height={24} />,
  ['USDe']: <TokenUsdeIcon width={24} height={24} />,
} as const;

type TokenSelectHookFormProps = {
  options: TokenOption[];
  fieldName?: string;
  // the amount field, reset to its default on a token change
  resetField?: string;
  // false keeps the amount across the token change and re-validates it;
  // only for forms whose tokens share decimals, the amount is in base units
  resetAmount?: boolean;
  errorField?: string;
  onChange?: (value: TokenSymbol) => void;
  warning?: boolean;
  disabled?: boolean;
};

export const TokenSelectHookForm = ({
  options,
  fieldName = 'token',
  resetField = 'amount',
  resetAmount = true,
  errorField = 'amount',
  onChange,
  warning,
  disabled = false,
}: TokenSelectHookFormProps) => {
  const { field } = useController<Record<string, TokenSymbol>>({
    name: fieldName,
  });
  const { setValue, getValues, clearErrors, trigger } = useFormContext();

  const { errors, defaultValues } = useFormState<Record<string, unknown>>({
    name: errorField,
  });

  return (
    <SelectIconStyle
      {...field}
      disabled={disabled}
      warning={warning}
      icon={iconsMap[field.value]}
      data-testid="drop-down"
      error={isValidationErrorTypeValidate(errors[errorField]?.type)}
      onChange={(value: OptionValue) => {
        setValue(fieldName, value, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
        if (resetAmount) {
          setValue(resetField, defaultValues?.[resetField], {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
          clearErrors(resetField);
        } else if (getValues(resetField) == null) {
          // an empty amount is not an error yet: only stale errors go
          clearErrors(resetField);
        } else {
          // the amount stays: re-check it against the new token (balance, limits)
          void trigger(resetField);
        }
        onChange?.(value as TokenSymbol);
      }}
    >
      {options.map(({ label, token }) => (
        <Option
          key={token}
          leftDecorator={iconsMap[token]}
          value={token}
          data-testid={token}
        >
          {label || getTokenSymbol(token)}
        </Option>
      ))}
    </SelectIconStyle>
  );
};
