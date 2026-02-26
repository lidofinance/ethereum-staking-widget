import { TokenEarnUsdIcon } from 'assets/earn-v2';
import { VaultPosition } from 'features/earn/shared/vault-position';
import { USD_VAULT_TOKEN_SYMBOL } from '../../consts';
import { useUsdVaultPosition } from '../../hooks/use-position';

export const UsdVaultPosition = () => {
  const { data, isLoading, usdBalance: usdAmount } = useUsdVaultPosition();

  return (
    <VaultPosition
      position={{
        symbol: USD_VAULT_TOKEN_SYMBOL,
        token: data?.earnusdTokenAddress,
        balance: data?.earnusdSharesBalance,
        icon: <TokenEarnUsdIcon />,
        isLoading: isLoading,
        usdAmount,
      }}
    />
  );
};
