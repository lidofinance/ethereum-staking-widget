import { formatUnits } from '@ethersproject/units';
import { TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';
import { InputDecoratorTvlStake } from 'features/withdrawals/shared/input-decorator-tvl-stake';
import { useFormContext, useController, useWatch } from 'react-hook-form';
import { InputDecoratorLocked } from 'shared/forms/components/input-decorator-locked';
import { InputDecoratorMaxButton } from 'shared/forms/components/input-decorator-max-button';
import { InputNumber } from 'shared/forms/components/input-number';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

import {
  RequestFormInputType,
  useRequestFormData,
} from 'features/withdrawals/request/request-form-context';
export const AmountInput = () => {
  const { setValue } = useFormContext();
  const { balanceSteth, balanceWSteth, isTokenLocked } = useRequestFormData();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });
  const {
    field,
    fieldState: { error },
  } = useController<RequestFormInputType, 'value'>({
    name: 'value',
  });

  const balanceDiff =
    error?.type === 'validate_tvl_joke'
      ? (error as unknown as { balanceDiffSteth?: BigNumber })?.balanceDiffSteth
      : undefined;

  const balance = token === TOKENS.STETH ? balanceSteth : balanceWSteth;

  const handleClickMax =
    balance && balance.gt(0)
      ? () => {
          setValue('value', formatUnits(balance), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
      : undefined;

  return (
    <InputNumber
      fullwidth
      placeholder="0"
      rightDecorator={
        balanceDiff ? (
          <InputDecoratorTvlStake tvlDiff={balanceDiff} />
        ) : (
          <>
            <InputDecoratorMaxButton
              onClick={handleClickMax}
              disabled={!handleClickMax}
            />
            {isTokenLocked ? <InputDecoratorLocked /> : undefined}
          </>
        )
      }
      label={`${getTokenDisplayName(token)} amount`}
      {...field}
    />
  );
};
