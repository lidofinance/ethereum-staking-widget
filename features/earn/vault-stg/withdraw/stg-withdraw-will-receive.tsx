import { useWatch } from 'react-hook-form';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';
import { TokenWstethIcon } from 'assets/earn';
import { STGWithdrawFormValues } from './form-context/types';
import { useSTGPreviewWithdraw } from './hooks/use-stg-preview-withdraw';

export const STGWithdrawWillReceive = () => {
  const { amount } = useWatch<STGWithdrawFormValues>();

  const { data, isLoading } = useSTGPreviewWithdraw({ shares: amount });

  return (
    <VaultWillReceive
      icon={<TokenWstethIcon width={16} height={16} viewBox="0 0 20 20" />}
      amount={data?.wsteth}
      symbol="wstETH"
      usdAmount={data.usd}
      isLoading={isLoading}
    />
  );
};
