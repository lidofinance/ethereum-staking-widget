import { useController, useFormState, useFormContext } from 'react-hook-form';

import { SelectIcon, Option, Eth, Steth, Wsteth } from '@lidofinance/lido-ui';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { isValidationErrorTypeDefault } from 'shared/hook-form/validation/validation-error';
import { TOKENS as TOKENS_SDK } from '@lido-sdk/constants';

export const TOKENS = {
  ETH: 'ETH',
  [TOKENS_SDK.STETH]: TOKENS_SDK.STETH,
  [TOKENS_SDK.WSTETH]: TOKENS_SDK.WSTETH,
};
export type TOKENS = keyof typeof TOKENS;

const iconsMap = {
  [TOKENS.ETH]: <Eth />,
  [TOKENS.STETH]: <Steth />,
  [TOKENS.WSTETH]: <Wsteth />,
} as const;

type TokenSelectHookFormProps<T extends TOKENS> = {
  options: T[];
  fieldName?: string;
  resetField?: string;
  errorField?: string;
  onChange?: (value: T) => void;
};

export const TokenSelectHookForm = <T extends TOKENS>({
  options,
  fieldName = 'token',
  resetField = 'amount',
  errorField = 'amount',
  onChange,
}: TokenSelectHookFormProps<T>) => {
  const { field } = useController({ name: fieldName });
  const { setValue, clearErrors } = useFormContext();

  const { errors, defaultValues } = useFormState<Record<string, unknown>>({
    name: errorField,
  });

  return (
    <SelectIcon
      {...field}
      icon={iconsMap[field.value]}
      error={isValidationErrorTypeDefault(errors[errorField]?.type)}
      onChange={(value: T) => {
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
        onChange?.(value);
      }}
    >
      {options.map((token) => (
        <Option key={token} leftDecorator={iconsMap[token]} value={token}>
          {getTokenDisplayName(token)}
        </Option>
      ))}
    </SelectIcon>
  );
};
