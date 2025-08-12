import { useWatch } from 'react-hook-form';
import { FormatPrice, FormatToken } from 'shared/formatters';

import type { GGVDepositFormValues } from './form-context/types';
import { GGV_TOKEN_SYMBOL } from '../consts';
import { useGGVPreviewDeposit } from '../hooks/use-gg-preview-deposit';

export const GGVWillReceive = () => {
  const { amount, token } = useWatch<GGVDepositFormValues>();
  const { data } = useGGVPreviewDeposit(amount, token);
  return (
    <div>
      You will receive{' '}
      <FormatToken
        symbol={GGV_TOKEN_SYMBOL}
        amount={data.shares}
        fallback="-"
      />
      <FormatPrice amount={data.usd} />
    </div>
  );
};
