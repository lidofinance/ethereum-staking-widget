import { useWatch } from 'react-hook-form';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';
import { STG_TOKEN_SYMBOL } from '../consts';
import { STGDepositFormValues } from './form-context/types';
import { TokenDvstethIcon } from 'assets/earn';

export const STGWillReceive = () => {
  const { amount /*token*/ } = useWatch<STGDepositFormValues>();

  const isLoading = false;
  const data = {
    shares: amount ? amount / 2n : 0n, // Placeholder logic
    usd: amount ? 150 : 0, // Placeholder logic
  };

  return (
    <VaultWillReceive
      icon={<TokenDvstethIcon viewBox="0 0 28 28" width={16} height={16} />}
      amount={data.shares}
      symbol={STG_TOKEN_SYMBOL}
      usdAmount={data.usd}
      isLoading={isLoading}
    />
  );
};
