import { useState, type FC } from 'react';

import {
  DisclaimerSection,
  AprDisclaimer,
  LegalDisclaimer,
  ButtonInline,
} from 'shared/components';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { useEarnState } from '../shared/hooks/use-earn-state';
import { DrawerRight } from '../shared/drawer-right';
import { UpgradeCardVaultsList } from '../shared/upgrade-card-vaults-list';

import { useGeoDebug } from 'shared/hooks/use-geo-debug';

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
  AccordionTransparentStyled,
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
  const [isAccordionAnimating, setIsAccordionAnimating] = useState(false);

  const { data: geoDebugData, isLoading } = useGeoDebug();

  const actualVaults = [] as typeof earnVaultsEnabled;
  const deprecatedVaults = [] as typeof earnVaultsEnabled;

  earnVaultsEnabled.forEach((vault) => {
    if (vault.deprecated) {
      deprecatedVaults.push(vault);
    } else {
      actualVaults.push(vault);
    }
  });

  const hasDeprecatedVaults = deprecatedVaults.length > 0;

  if (geoDebugData && !isLoading) {
    return (
      <div>
        <div>Your Country: {geoDebugData.country}</div>
        <div>Is via Cloudflare: {geoDebugData.viaCloudflare}</div>

        <div>CF:</div>
        <div>Your CF Country: {geoDebugData.values['cf-ipcountry']}</div>
        <div>Your CF Continent: {geoDebugData.values['cf-ipcontinent']}</div>
        <div>Your CF Region Code: {geoDebugData.values['cf-region-code']}</div>
        <div>Your CF Timezone: {geoDebugData.values['cf-timezone']}</div>
        <div>
          Your CF Accept Language: {geoDebugData.values['accept-language']}
        </div>

        <div>Your geo debug data: {JSON.stringify(geoDebugData)}</div>
      </div>
    );
  }

  return (
    <>
      <ListSubtitle>
        Deploy ETH and USD stablecoins into DeFi vaults for on-chain rewards
        through the world&apos;s leading protocols.
        <br />
        <ButtonInline
          onClick={(event) => {
            event.preventDefault();
            trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnListHowLidoEarnWorks);
            setIsDrawerRightOpen(true);
          }}
          data-testid="how-lido-earn-works-button"
        >
          How Lido Earn Works
        </ButtonInline>
      </ListSubtitle>
      <ListWrapper>
        <UpgradeCardVaultsList setIsDrawerRightOpen={setIsDrawerRightOpen} />
        <CardsStack>
          {actualVaults.map((vault) => {
            const VaultCard = VAULT_CARDS[vault.name];
            return <VaultCard key={vault.name} />;
          })}
        </CardsStack>

        {hasDeprecatedVaults && (
          <AccordionTransparentStyled
            data-animating={isAccordionAnimating || undefined}
            onExpand={() => setIsAccordionAnimating(false)}
            onCollapse={() => setIsAccordionAnimating(false)}
            summary={
              <AccordionTitle
                data-testid="upgrading-vaults"
                onClick={() => setIsAccordionAnimating(true)}
              >
                Upgrading vaults
              </AccordionTitle>
            }
            withoutBorder
            data-testid="deprecated-vaults-list"
          >
            <CardsStack>
              {deprecatedVaults.map((vault) => {
                const VaultCard = VAULT_CARDS[vault.name];
                return <VaultCard key={vault.name} />;
              })}
            </CardsStack>
          </AccordionTransparentStyled>
        )}

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
