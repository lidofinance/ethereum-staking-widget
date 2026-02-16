import { TokenEarnethIcon } from 'assets/earn-v2';
import { VaultPosition } from 'features/earn/shared/vault-position';
import { ETH_VAULT_TOKEN_SYMBOL } from '../../consts';
import { useEthVaultPosition } from '../../hooks/use-position';

export const EthVaultPosition = () => {
  const {
    data,
    isLoading,
    usdBalance: usdAmount,
    usdQuery: { isLoading: isLoadingUsd } = { isLoading: false },
  } = useEthVaultPosition();

  return (
    <VaultPosition
      position={{
        symbol: ETH_VAULT_TOKEN_SYMBOL,
        token: data?.earnethTokenAddress,
        balance: data?.earnethSharesBalance,
        icon: <TokenEarnethIcon />,
        isLoading: isLoading || isLoadingUsd,
        usdAmount,
      }}
    />
  );
};
