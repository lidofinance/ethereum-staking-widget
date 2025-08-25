import { useWatch } from 'react-hook-form';

import { TokenGGIcon } from 'assets/earn';

import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';

import { useGGVPreviewDeposit } from './hooks/use-ggv-preview-deposit';
import { GGV_TOKEN_SYMBOL } from '../consts';
import type { GGVDepositFormValues } from './form-context/types';

export const GGVWillReceive = () => {
  const { amount, token } = useWatch<GGVDepositFormValues>();
  const { data, isLoading } = useGGVPreviewDeposit(amount, token);
  return (
    <VaultWillReceive
      icon={<TokenGGIcon viewBox="0 0 28 28" width={16} height={16} />}
      amount={data.shares}
      symbol={GGV_TOKEN_SYMBOL}
      usdAmount={data.usd}
      isLoading={isLoading}
    />
  );
};
