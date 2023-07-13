import { TOKENS } from '@lido-sdk/constants';
import { SelectIcon, Steth, Wsteth, Option } from '@lidofinance/lido-ui';

import { useController } from 'react-hook-form';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';

const iconsMap = {
  [TOKENS.WSTETH]: <Wsteth />,
  [TOKENS.STETH]: <Steth />,
};

export const TokenInput = () => {
  const {
    field,
    fieldState: { error },
  } = useController<RequestFormInputType, 'token'>({
    name: 'token',
  });
  return (
    <SelectIcon icon={iconsMap[field.value]} error={error} {...field}>
      <Option leftDecorator={iconsMap[TOKENS.STETH]} value={TOKENS.STETH}>
        {getTokenDisplayName(TOKENS.STETH)}
      </Option>
      <Option leftDecorator={iconsMap[TOKENS.WSTETH]} value={TOKENS.WSTETH}>
        {getTokenDisplayName(TOKENS.WSTETH)}
      </Option>
    </SelectIcon>
  );
};
