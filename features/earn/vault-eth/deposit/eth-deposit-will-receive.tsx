import { useWatch } from 'react-hook-form';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';
import { ETH_TOKEN_SYMBOL } from '../consts';
import { ETHDepositFormValues } from './form-context/types';
import { TokenEarnethIcon } from 'assets/earn-v2';
import { useETHPreviewDeposit } from './hooks/use-eth-preview-deposit';

export const ETHWillReceive = () => {
  const { amount, token } = useWatch<ETHDepositFormValues>();

  const { data, isLoading } = useETHPreviewDeposit({ amount, token });

  return (
    <VaultWillReceive
      icon={<TokenEarnethIcon width={16} height={16} />}
      amount={data.shares}
      symbol={ETH_TOKEN_SYMBOL}
      usdAmount={data.usd}
      ethAmount={data.eth}
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
