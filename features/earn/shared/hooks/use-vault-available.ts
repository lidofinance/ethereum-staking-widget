import { getContractAddress } from 'config/networks/contract-address';
import { useEarnState } from 'features/earn/shared/hooks/use-earn-state';
import { useDappStatus } from 'modules/web3';
import { NetworkConfig } from 'config/networks/networks-map';

/**
 * Hook to check vault and its features availability
 * Differs from `isVaultEnabled` in that it also checks for contract address and supported chain
 */
export const useVaultAvailable = ({
  vaultName,
  contractName,
}: {
  vaultName: string;
  contractName: keyof NetworkConfig['contracts'];
}) => {
  const { chainId, isSupportedChain } = useDappStatus();
  const { earnVaults, isVaultEnabled } = useEarnState();

  // One of the conditions for a vault to be enabled – it must be present in the vaults config
  const vaultConfig = earnVaults.find((vault) => vault.name === vaultName);

  const isVaultAvailable =
    isVaultEnabled(vaultName) &&
    !!getContractAddress(chainId, contractName) &&
    isSupportedChain;

  // deposit and withdraw features are enabled by default
  // For disabling a feature - it must be explicitly disabled in the vault config
  const isDepositEnabled = isVaultAvailable && vaultConfig?.deposit !== false;
  const isWithdrawEnabled = isVaultAvailable && vaultConfig?.withdraw !== false;

  const depositPauseReasonText = vaultConfig?.depositPauseReasonText;
  const withdrawPauseReasonText = vaultConfig?.withdrawPauseReasonText;

  return {
    isVaultAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
    depositPauseReasonText,
    withdrawPauseReasonText,
  };
};
