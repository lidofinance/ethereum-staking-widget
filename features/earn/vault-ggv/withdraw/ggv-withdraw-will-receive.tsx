import { useWatch } from 'react-hook-form';

import { TokenWstethIcon } from 'assets/earn';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';

import { useGGVPreviewWithdrawal } from './hooks/use-ggv-preview-withdrawal';

import type { GGVWithdrawalFormValues } from './types';

export const GGVWithdrawWillReceive = () => {
  const { amount } = useWatch<GGVWithdrawalFormValues>();
  const { data, isLoading } = useGGVPreviewWithdrawal(amount);
  return (
    <VaultWillReceive
      icon={<TokenWstethIcon viewBox="0 0 20 20" width={16} height={16} />}
      amount={data.wsteth}
      symbol={getTokenDisplayName('wstETH')}
      usdAmount={data.usd}
      ethAmount={data.eth}
      isLoading={isLoading}
    />
  );
};
