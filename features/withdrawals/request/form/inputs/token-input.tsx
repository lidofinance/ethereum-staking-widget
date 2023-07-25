import { TOKENS } from '@lido-sdk/constants';
import { SelectIcon, Steth, Wsteth, Option } from '@lidofinance/lido-ui';

import { useController, useFormContext, useFormState } from 'react-hook-form';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { TokensWithdrawable } from 'features/withdrawals/types/tokens-withdrawable';

const iconsMap = {
  [TOKENS.WSTETH]: <Wsteth />,
  [TOKENS.STETH]: <Steth />,
};

export const TokenInput = () => {
  const { setValue, getFieldState } = useFormContext<RequestFormInputType>();
  const { field } = useController<RequestFormInputType, 'token'>({
    name: 'token',
  });

  const { errors } = useFormState<RequestFormInputType>({ name: 'amount' });

  return (
    <SelectIcon
      {...field}
      icon={iconsMap[field.value]}
      error={!!errors.amount}
      onChange={(value: TokensWithdrawable) => {
        // this softly changes token state, resets amount and only validates if it was touched
        const { isTouched: isAmountTouched } = getFieldState('amount');
        setValue('token', value, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
        setValue('amount', null, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: isAmountTouched,
        });
      }}
    >
      <Option leftDecorator={iconsMap[TOKENS.STETH]} value={TOKENS.STETH}>
        {getTokenDisplayName(TOKENS.STETH)}
      </Option>
      <Option leftDecorator={iconsMap[TOKENS.WSTETH]} value={TOKENS.WSTETH}>
        {getTokenDisplayName(TOKENS.WSTETH)}
      </Option>
    </SelectIcon>
  );
};
