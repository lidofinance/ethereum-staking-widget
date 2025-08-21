import { useWatch } from 'react-hook-form';

import { TokenDvstethIcon } from 'assets/earn';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';

import { useDVVPreviewDeposit } from './hooks/use-dvv-preview-deposit';
import { DVV_TOKEN_SYMBOL } from '../consts';
import type { DVVDepositFormValues } from './types';

export const DVVDepositWillReceive = () => {
  const { amount } = useWatch<DVVDepositFormValues>();
  const { data, isLoading } = useDVVPreviewDeposit(amount);

  return (
    <VaultWillReceive
      icon={<TokenDvstethIcon width={16} height={16} viewBox="0 0 28 28" />}
      symbol={DVV_TOKEN_SYMBOL}
      isLoading={isLoading}
      amount={data.shares}
      usdAmount={data?.usd}
    />
  );
};
