import type { FC } from 'react';

import { AprDisclaimer } from 'shared/components/apr-disclaimer';

import { VaultCardGGV } from '../vault-ggv';
import { VaultCardDVV } from '../vault-dvv';
import { VaultCardSTG } from '../vault-stg';

import { VaultsListWrapper } from './styles';
import { useVaultConfig } from '../shared/hooks/use-vault-config';

const VAULT_CARDS = {
  ggv: VaultCardGGV,
  dvv: VaultCardDVV,
  'strategy-dont-enable': VaultCardSTG,
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
      <AprDisclaimer mentionAPY />
    </>
  );
};
