import { useController, useFormState, useFormContext } from 'react-hook-form';

import { SelectIcon, Option, Eth, Steth } from '@lidofinance/lido-ui';

import { trackEvent } from '@lidofinance/analytics-matomo';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { WrapFormInputType } from '../../wrap-form-context';
import { TokensWrappable, TOKENS_TO_WRAP } from 'features/wrap/types';
import { MATOMO_CLICK_EVENTS } from 'config';
import { isValidationErrorTypeDefault } from 'shared/hook-form/validation-error';

const iconsMap = {
  [TOKENS_TO_WRAP.ETH]: <Eth />,
  [TOKENS_TO_WRAP.STETH]: <Steth />,
};

export const TokenInput = () => {
  const { setValue } = useFormContext<WrapFormInputType>();
  const { field } = useController<WrapFormInputType, 'token'>({
    name: 'token',
  });

  const { errors } = useFormState<WrapFormInputType>({ name: 'amount' });

  return (
    <SelectIcon
      {...field}
      icon={iconsMap[field.value]}
      error={isValidationErrorTypeDefault(errors.amount?.type)}
      onChange={(value: TokensWrappable) => {
        setValue('token', value, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
        setValue('amount', null, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
        trackEvent(
          ...(value === TOKENS_TO_WRAP.ETH
            ? MATOMO_CLICK_EVENTS.wrapTokenSelectEth
            : MATOMO_CLICK_EVENTS.wrapTokenSelectSteth),
        );
      }}
    >
      <Option
        leftDecorator={iconsMap[TOKENS_TO_WRAP.STETH]}
        value={TOKENS_TO_WRAP.STETH}
      >
        {getTokenDisplayName(TOKENS_TO_WRAP.STETH)}
      </Option>
      <Option
        leftDecorator={iconsMap[TOKENS_TO_WRAP.ETH]}
        value={TOKENS_TO_WRAP.ETH}
      >
        {getTokenDisplayName(TOKENS_TO_WRAP.ETH)}
      </Option>
    </SelectIcon>
  );
};
