import { useWatch } from 'react-hook-form';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';
import { TokenUsdcIcon } from 'assets/earn-v2';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { TOKENS } from 'consts/tokens';
import { UsdVaultWithdrawFormValues } from './form-context/types';
import { useUsdVaultPreviewWithdraw } from './hooks/use-preview-withdraw';

export const UsdVaultWithdrawWillReceive = () => {
  const { amount } = useWatch<UsdVaultWithdrawFormValues>();

  const { data, isLoading } = useUsdVaultPreviewWithdraw({ shares: amount });
  const usdc = data.assets;

  return (
    <VaultWillReceive
      icon={<TokenUsdcIcon width={16} height={16} />}
      amount={usdc}
      symbol={getTokenSymbol(TOKENS.usdc)}
      fallbackSecondaryValue="" // TODO: remove if usdAmount is added
      isLoading={isLoading}
      help={
        <>
          The final claimable USDC may differ slightly, since your request
          continues earning until processing is complete.
        </>
      }
    />
  );
};
