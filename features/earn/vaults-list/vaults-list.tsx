import { useState } from 'react';
import {
  Accordion,
  Button,
  Divider,
  IconInfo,
  Typography,
} from '@lidofinance/lido-app-ui';

import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { useEarnState } from '../shared/hooks/use-earn-state';
import { DrawerRight } from '../shared/drawer-right';
import { EarnInfoBanner } from '../shared/earn-info-banner';
import { EarnDisclaimers } from '../shared/disclaimers';

import { VaultCardGGV } from '../vault-ggv/vault-card-ggv';
import { VaultCardDVV } from '../vault-dvv/vault-card-dvv';
import { VaultCardSTG } from '../vault-stg/vault-card-stg';
import { UsdVaultCard } from '../vault-usd';
import { EthVaultCard } from '../vault-eth';

import { VaultsListFaqDrawer } from './faq-drawer';
import {
  ListRoot,
  Hero,
  CardsColumn,
  LegacyVaults,
  LegacyVaultsList,
} from './styles';

const VAULT_CARDS = {
  ggv: VaultCardGGV,
  dvv: VaultCardDVV,
  strategy: VaultCardSTG,
  usd: UsdVaultCard,
  eth: EthVaultCard,
};

export const EarnVaultsList = () => {
  const { earnVaultsEnabled } = useEarnState();
  const [isDrawerRightOpen, setIsDrawerRightOpen] = useState(false);

  const actualVaults = earnVaultsEnabled.filter((vault) => !vault.deprecated);
  const deprecatedVaults = earnVaultsEnabled.filter(
    (vault) => vault.deprecated,
  );

  return (
    <>
      <ListRoot data-testid="earn-vaults-list">
        <Hero>
          <Typography variant="h1">Earn, powered by Lido</Typography>
          <Typography variant="body" color="secondary">
            Deploy ETH and USD stablecoins into DeFi vaults
            for&nbsp;on&#8209;chain rewards through the world&apos;s leading
            protocols.
          </Typography>
          <Button
            variant="ghost"
            size="small"
            iconLeft={<IconInfo />}
            onClick={() => {
              trackMatomoEvent(
                MATOMO_EARN_EVENTS_TYPES.earnListHowLidoEarnWorks,
              );
              setIsDrawerRightOpen(true);
            }}
            dataTestId={{ root: 'how-lido-earn-works-button' }}
          >
            How Lido Earn Works
          </Button>
        </Hero>

        <CardsColumn>
          <EarnInfoBanner />

          {actualVaults.map((vault) => {
            const VaultCard = VAULT_CARDS[vault.name];
            return <VaultCard key={vault.name} />;
          })}

          {deprecatedVaults.length > 0 && (
            <LegacyVaults data-testid="deprecated-vaults-list">
              <Accordion
                title="Upgrading vaults"
                border={false}
                dataTestId={{ header: 'upgrading-vaults' }}
              >
                <LegacyVaultsList>
                  {deprecatedVaults.map((vault, index) => {
                    const VaultCard = VAULT_CARDS[vault.name];
                    return (
                      <div key={vault.name}>
                        {index > 0 && <Divider />}
                        <VaultCard />
                      </div>
                    );
                  })}
                </LegacyVaultsList>
              </Accordion>
            </LegacyVaults>
          )}
        </CardsColumn>

        <EarnDisclaimers />

        <DrawerRight
          onClose={() => setIsDrawerRightOpen(false)}
          isOpen={isDrawerRightOpen}
        />
      </ListRoot>

      <VaultsListFaqDrawer />
    </>
  );
};
