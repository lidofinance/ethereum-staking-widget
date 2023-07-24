import { TOKENS } from '@lido-sdk/constants';
import { SelectIcon, Steth, Wsteth, Option } from '@lidofinance/lido-ui';

import { useController, useFormState } from 'react-hook-form';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { TokensWithdrawable } from 'features/withdrawals/types/tokens-withdrawable';

const iconsMap = {
  [TOKENS.WSTETH]: <Wsteth />,
  [TOKENS.STETH]: <Steth />,
};

export const TokenInput = () => {
  const { field } = useController<RequestFormInputType, 'token'>({
    name: 'token',
  });

  const {
    errors: { amount },
  } = useFormState<RequestFormInputType>({ name: 'amount' });

  return (
    <SelectIcon
      {...field}
      icon={iconsMap[field.value]}
      error={!!amount}
      onChange={(value: TokensWithdrawable) => {
        field.onChange(value);
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
