import type { FC } from 'react';

import { VaultCardGGV } from '../vault-ggv';
import { VaultCardDVV } from '../vault-dvv';

import { VaultsListWrapper, VaultListDisclaimer } from './styles';
import { useVaultConfig } from '../shared/use-vault-config';

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
      <VaultListDisclaimer>
        * Please note that APR/APY figures are only estimates and subject to
        change at any time. Past performance is not a guarantee of future
        results. Rewards are influenced by factors outside the platform’s
        control, including changes to blockchain protocols and validator
        performance.
      </VaultListDisclaimer>
    </>
  );
};
