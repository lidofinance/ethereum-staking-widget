import invariant from 'tiny-invariant';
import { useWatch } from 'react-hook-form';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';
import { USD_VAULT_TOKEN_SYMBOL } from '../consts';
import { USDDepositFormValues } from './form-context/types';
import { TokenEarnUsdIcon } from 'assets/earn-v2';
import { useUsdVaultPreviewDeposit } from './hooks/use-preview-deposit';
import { asUsdDepositToken } from '../utils';

export const UsdVaultDepositWillReceive = () => {
  const { amount, token: tokenSymbol } = useWatch<USDDepositFormValues>();
  invariant(tokenSymbol, 'Token is required to preview deposit');

  const { data, isLoading } = useUsdVaultPreviewDeposit({
    amount,
    token: asUsdDepositToken(tokenSymbol),
  });

  return (
    <VaultWillReceive
      icon={<TokenEarnUsdIcon width={16} height={16} />}
      amount={data.shares}
      symbol={USD_VAULT_TOKEN_SYMBOL}
      // TODO: show USD amount, check where to get conversion rate for earnETH
      // usdAmount={data.usd}
      fallbackSecondaryValue="" // remove when usdAmount is added
      isLoading={isLoading}
      help={
        <>
          The earnUSD token represents your share in the EarnUSD vault. Its
          USD-equivalent value reflects your deposit and the vault&apos;s
          performance, and may fluctuate over time.
        </>
      }
    />
  );
};
