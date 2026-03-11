import invariant from 'tiny-invariant';
import { useWatch } from 'react-hook-form';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';
import { ETH_VAULT_TOKEN_SYMBOL } from '../consts';
import { ETHDepositFormValues } from './form-context/types';
import { TokenEarnEthIcon } from 'assets/earn-v2';
import { useEthVaultPreviewDeposit } from './hooks/use-preview-deposit';
import { asEthDepositToken } from '../utils';

export const EthVaultDepositWillReceive = () => {
  const { amount, token: tokenSymbol } = useWatch<ETHDepositFormValues>();
  invariant(tokenSymbol, 'Token is required to preview deposit');

  const { data, isLoading } = useEthVaultPreviewDeposit({
    amount,
    token: asEthDepositToken(tokenSymbol),
  });

  return (
    <VaultWillReceive
      icon={<TokenEarnEthIcon width={16} height={16} />}
      amount={data.shares}
      symbol={ETH_VAULT_TOKEN_SYMBOL}
      usdAmount={data.usd}
      ethAmount={data.eth}
      isLoading={isLoading}
      help={
        <>
          The final claimable {ETH_VAULT_TOKEN_SYMBOL} amount may slightly
          differ based on the latest token price update
        </>
      }
    />
  );
};
