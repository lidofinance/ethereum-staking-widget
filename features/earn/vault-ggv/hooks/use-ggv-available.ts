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
  const isDepositEnabled = !vaults.some(
    (vault) => vault.name === VAULT_NAME && vault.deposit === false,
  );
  const isWithdrawEnabled = !vaults.some(
    (vault) => vault.name === VAULT_NAME && vault.withdraw === false,
  );
  const isGGVAvailable =
    !!getContractAddress(chainId, 'ggvVault') &&
    isEarnPageEnabled &&
    isDepositEnabled;

  return {
    isGGVAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
  };
};
