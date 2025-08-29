import type { FC } from 'react';

import { VaultCardGGV } from '../vault-ggv';
import { VaultCardDVV } from '../vault-dvv';

import { VaultsListWrapper } from './styles';
import { useVaultConfig } from '../shared/hooks/use-vault-config';
import { VaultDisclaimer } from '../shared/vault-disclaimer';

const VAULT_CARDS = {
  ggv: VaultCardGGV,
  dvv: VaultCardDVV,
};

export const EarnVaultsList: FC = () => {
  const { vaults } = useVaultConfig();
  return (
    <>
      <VaultsListWrapper>
        {vaults.map((vault) => {
          const VaultCard = VAULT_CARDS[vault.name];
          return <VaultCard key={vault.name} />;
        })}
      </VaultsListWrapper>
      <VaultDisclaimer />
    </>
  );
};
