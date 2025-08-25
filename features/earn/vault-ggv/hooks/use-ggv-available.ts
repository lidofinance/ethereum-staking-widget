import { useConfig } from 'config';
import { getContractAddress } from 'config/networks/contract-address';
import { useVaultConfig } from 'features/earn/shared/hooks/use-vault-config';
import { useDappStatus } from 'modules/web3';
import { EARN_PATH } from 'consts/urls';
import { EARN_VAULT_GGV_SLUG as VAULT_NAME } from '../../consts';

export const useGGVAvailable = () => {
  const { pages } = useConfig().externalConfig;
  const { chainId } = useDappStatus();
  const { vaults } = useVaultConfig();

  const isEarnPageEnabled = !pages[EARN_PATH]?.shouldDisable;

  // One of the conditions for a vault to be enabled – it must be present in the vaults config
  const GGVConfig = vaults.find((vault) => vault.name === VAULT_NAME);
  const isGGVInConfig = !!GGVConfig;

  const isGGVAvailable =
    !!getContractAddress(chainId, 'ggvVault') &&
    isEarnPageEnabled &&
    isGGVInConfig;

  // deposit and withdraw are NOT enabled by default
  // If the vault passes global availability checks (isGGVAvailable), each feature
  // must be explicitly enabled in the vault config (deposit === true / withdraw === true).
  const isDepositEnabled = isGGVAvailable && GGVConfig.deposit === true;
  const isWithdrawEnabled = isGGVAvailable && GGVConfig.withdraw === true;

  return {
    isGGVAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
  };
};
