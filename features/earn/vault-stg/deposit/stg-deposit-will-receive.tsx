import { useWatch } from 'react-hook-form';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';
import { STG_TOKEN_SYMBOL } from '../consts';
import { STGDepositFormValues } from './form-context/types';
import { TokenStrethIcon } from 'assets/earn';
import { useSTGPreviewDeposit } from './hooks/use-stg-preview-deposit';

export const STGWillReceive = () => {
  const { amount, token } = useWatch<STGDepositFormValues>();

  const { data, isLoading } = useSTGPreviewDeposit({ amount, token });

  return (
    <VaultWillReceive
      icon={<TokenStrethIcon width={16} height={16} />}
      amount={data.shares}
      symbol={STG_TOKEN_SYMBOL}
      usdAmount={data.usd}
      isLoading={isLoading}
      help={
        <>
          The final claimable strETH amount may slightly differ based on the
          latest token price update
        </>
      }
    />
  );
};
