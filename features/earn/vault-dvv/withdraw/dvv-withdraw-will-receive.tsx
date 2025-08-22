import { useWatch } from 'react-hook-form';

import { TokenWstethIcon } from 'assets/earn';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';
import { useDVVPreviewWithdrawal } from './hooks/use-dvv-preview-withdrawal';
import { DVVWithdrawalFormValues } from './types';

export const DVVWithdrawWillReceive = () => {
  const { amount } = useWatch<DVVWithdrawalFormValues>();
  const { data, isLoading } = useDVVPreviewWithdrawal(amount);

  return (
    <VaultWillReceive
      icon={<TokenWstethIcon viewBox="0 0 20 20" width={16} height={16} />}
      symbol={getTokenDisplayName('wstETH')}
      amount={data.wsteth}
      usdAmount={data.usd}
      isLoading={isLoading}
    />
  );
};
