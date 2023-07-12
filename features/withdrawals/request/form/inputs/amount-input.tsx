import { TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';
import { InputDecoratorTvlStake } from 'features/withdrawals/shared/input-decorator-tvl-stake';
import { useController, useWatch } from 'react-hook-form';
import { InputAmount } from 'shared/forms/components/input-amount';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

import {
  RequestFormInputType,
  useRequestFormData,
} from 'features/withdrawals/request/request-form-context';
export const AmountInput = () => {
  const { balanceSteth, balanceWSteth, isTokenLocked } = useRequestFormData();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });

  const {
    field,
    fieldState: { error },
  } = useController<RequestFormInputType, 'amount'>({
    name: 'amount',
  });

  const balanceDiff =
    error?.type === 'validate_tvl_joke'
      ? (error as unknown as { balanceDiffSteth?: BigNumber })?.balanceDiffSteth
      : undefined;

  const balance = token === TOKENS.STETH ? balanceSteth : balanceWSteth;

  return (
    <InputAmount
      fullwidth
      placeholder="0"
      isLocked={isTokenLocked}
      maxValue={balance}
      rightDecorator={
        balanceDiff && <InputDecoratorTvlStake tvlDiff={balanceDiff} />
      }
      label={`${getTokenDisplayName(token)} amount`}
      {...field}
    />
  );
};
