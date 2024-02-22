import { useController, useFormState, useFormContext } from 'react-hook-form';

import {
  SelectIcon,
  Option,
  Eth,
  Steth,
  Wsteth,
  OptionValue,
} from '@lidofinance/lido-ui';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { isValidationErrorTypeValidate } from 'shared/hook-form/validation/validation-error';
import { TOKENS as TOKENS_SDK } from '@lido-sdk/constants';

export const TOKENS = {
  ETH: 'ETH',
  [TOKENS_SDK.STETH]: TOKENS_SDK.STETH,
  [TOKENS_SDK.WSTETH]: TOKENS_SDK.WSTETH,
} as const;
export type TOKENS = keyof typeof TOKENS;

export type TokenOption = {
  label?: string;
  token: TOKENS;
};

const iconsMap = {
  [TOKENS.ETH]: <Eth />,
  [TOKENS.STETH]: <Steth />,
  [TOKENS.WSTETH]: <Wsteth />,
} as const;

type TokenSelectHookFormProps = {
  options: TokenOption[];
  fieldName?: string;
  resetField?: string;
  errorField?: string;
  onChange?: (value: TOKENS) => void;
  warning?: boolean;
};

export const TokenSelectHookForm = ({
  options,
  fieldName = 'token',
  resetField = 'amount',
  errorField = 'amount',
  onChange,
  warning,
}: TokenSelectHookFormProps) => {
  const { field } = useController<Record<string, TOKENS>>({ name: fieldName });
  const { setValue, clearErrors } = useFormContext();

  const { errors, defaultValues } = useFormState<Record<string, unknown>>({
    name: errorField,
  });

  return (
    <SelectIcon
      {...field}
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
        onChange?.(value as TOKENS);
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
    </SelectIcon>
  );
};
