import { useState, type FC } from 'react';

import {
  DisclaimerSection,
  AprDisclaimer,
  LegalDisclaimer,
} from 'shared/components';

import { useVaultConfig } from '../shared/hooks/use-vault-config';
import { DrawerRight } from '../shared/drawer-right';
import { UpgradeCard } from '../shared/upgrade-card';

import { VaultCardGGV } from '../vault-ggv/vault-card-ggv-v2';
import { VaultCardDVV } from '../vault-dvv/vault-card-dvv-v2';
import { VaultCardSTG } from '../vault-stg/vault-card-stg-v2';
import { VaultCardUSD } from '../vault-usd';
import { VaultCardETH } from '../vault-eth';

import { CardsStack, ListWrapper } from './styles';

const VAULT_CARDS = {
  ggv: VaultCardGGV,
  dvv: VaultCardDVV,
  strategy: VaultCardSTG,
  usd: VaultCardUSD,
  eth: VaultCardETH,
};

export const EarnVaultsList: FC = () => {
  const { vaults } = useVaultConfig();
  const [isDrawerRightOpen, setIsDrawerRightOpen] = useState(false);

  return (
    <>
      <ListWrapper>
        <UpgradeCard setIsDrawerRightOpen={setIsDrawerRightOpen} />
        <CardsStack>
          {vaults.map((vault) => {
            const VaultCard = VAULT_CARDS[vault.name];
            return <VaultCard key={vault.name} />;
          })}
        </CardsStack>

        <DisclaimerSection>
          <AprDisclaimer mentionAPY />
          <LegalDisclaimer />
        </DisclaimerSection>
      </ListWrapper>
      <DrawerRight
        onClose={() => setIsDrawerRightOpen(false)}
        isOpen={isDrawerRightOpen}
      />
    </>
  );
};
