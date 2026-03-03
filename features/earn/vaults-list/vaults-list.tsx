import { useState, type FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

import {
  DisclaimerSection,
  AprDisclaimer,
  LegalDisclaimer,
  ButtonInline,
} from 'shared/components';

import { useEarnState } from '../shared/hooks/use-earn-state';
import { DrawerRight } from '../shared/drawer-right';
import { UpgradeCard } from '../shared/upgrade-card';

import { VaultCardGGV } from '../vault-ggv/vault-card-ggv-v2';
import { VaultCardDVV } from '../vault-dvv/vault-card-dvv-v2';
import { VaultCardSTG } from '../vault-stg/vault-card-stg-v2';
import { UsdVaultCard } from '../vault-usd';
import { EthVaultCard } from '../vault-eth';

import {
  AccordionTitle,
  CardsStack,
  ListSubtitle,
  ListWrapper,
} from './styles';

const VAULT_CARDS = {
  ggv: VaultCardGGV,
  dvv: VaultCardDVV,
  strategy: VaultCardSTG,
  usd: UsdVaultCard,
  eth: EthVaultCard,
};

export const EarnVaultsList: FC = () => {
  const { earnVaultsEnabled } = useEarnState();
  const [isDrawerRightOpen, setIsDrawerRightOpen] = useState(false);

  const actualVaults = [] as typeof earnVaultsEnabled;
  const deprecatedVaults = [] as typeof earnVaultsEnabled;

  earnVaultsEnabled.forEach((vault) => {
    if (vault.deprecated) {
      deprecatedVaults.push(vault);
    } else {
      actualVaults.push(vault);
    }
  });

  return (
    <>
      <ListSubtitle>
        Deploy ETH and USD stablecoins into DeFi vaults for on-chain yield
        through the world&apos;s leading protocols.
        <br />
        <ButtonInline
          onClick={(event) => {
            event.preventDefault();
            setIsDrawerRightOpen(true);
          }}
        >
          How Lido Earn Works
        </ButtonInline>
      </ListSubtitle>
      <ListWrapper>
        <UpgradeCard setIsDrawerRightOpen={setIsDrawerRightOpen} />
        <CardsStack>
          {actualVaults.map((vault) => {
            const VaultCard = VAULT_CARDS[vault.name];
            return <VaultCard key={vault.name} />;
          })}
        </CardsStack>

        <AccordionTransparent
          summary={<AccordionTitle>Upgrading vaults</AccordionTitle>}
          withoutBorder
        >
          <CardsStack>
            {deprecatedVaults.map((vault) => {
              const VaultCard = VAULT_CARDS[vault.name];
              return <VaultCard key={vault.name} />;
            })}
          </CardsStack>
        </AccordionTransparent>

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
