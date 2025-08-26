import { useController, useFormState, useFormContext } from 'react-hook-form';

import { Option, Eth, Steth, Wsteth, OptionValue } from '@lidofinance/lido-ui';
import { TokenWethIcon } from 'assets/earn';

import {
  getTokenDisplayName,
  TOKEN_DISPLAY_NAMES,
} from 'utils/getTokenDisplayName';
import { isValidationErrorTypeValidate } from 'shared/hook-form/validation/validation-error';
import { SelectIconStyle } from './styles';

export type TokenOption = {
  label?: string;
  token: TOKEN_DISPLAY_NAMES;
};

const iconsMap: { [key in TOKEN_DISPLAY_NAMES]?: JSX.Element } = {
  ['ETH']: <Eth />,
  ['wETH']: <TokenWethIcon />,
  ['stETH']: <Steth />,
  ['wstETH']: <Wsteth />,
} as const;

type TokenSelectHookFormProps = {
  options: TokenOption[];
  fieldName?: string;
  resetField?: string;
  errorField?: string;
  onChange?: (value: TOKEN_DISPLAY_NAMES) => void;
  warning?: boolean;
  disabled?: boolean;
};

export const TokenSelectHookForm = ({
  options,
  fieldName = 'token',
  resetField = 'amount',
  errorField = 'amount',
  onChange,
  warning,
  disabled = false,
}: TokenSelectHookFormProps) => {
  const { field } = useController<Record<string, TOKEN_DISPLAY_NAMES>>({
    name: fieldName,
  });
  const { setValue, clearErrors } = useFormContext();

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
        setValue(resetField, defaultValues?.[resetField], {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
        clearErrors(resetField);
        onChange?.(value as TOKEN_DISPLAY_NAMES);
      }}
    >
      {options.map(({ label, token }) => (
        <Option
          key={token}
          leftDecorator={iconsMap[token]}
          value={token}
          data-testid={token}
        >
          {label || getTokenDisplayName(token)}
        </Option>
      ))}
    </SelectIconStyle>
  );
};
