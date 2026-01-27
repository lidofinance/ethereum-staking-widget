import { useState, FC } from 'react';
import { Question } from '@lidofinance/lido-ui';

import { EarnEthIcon, EarnUsdIcon } from 'assets/earn-new';

import {
  AprDisclaimer,
  DisclaimerSection,
  LegalDisclaimer,
} from 'shared/components';

import { UpgradeCard } from './upgrade-card';
import { VaultCard } from './vault-card/vault-card';
import { DrawerRight } from './drawer-right';
import { CardsStack, ListWrapper } from './styles';

const VAULTS = [
  {
    key: 'eth',
    title: 'Lido Earn ETH',
    description:
      'Lido Earn ETH vault utilizes tried and tested strategies with premier DeFi protocols for increased rewards on deposits of ETH or stETH.',
    stats: [
      {
        label: 'APY (7d avg.)',
        value: '7%',
        accent: true,
        labelIcon: <Question />,
        // TODO: replace with API value
      },
      {
        label: 'Total TVL',
        value: '$99.7M',
        // TODO: replace with API value
      },
      {
        label: 'My position',
        value: '—',
        muted: true,
        // TODO: replace with wallet position
      },
    ],
    ctaLabel: 'Deposit',
    variant: 'eth' as const,
  },
  {
    key: 'usd',
    title: 'Lido Earn USD',
    description:
      'Lido Earn USD Vault is curated for USD-denominated assets, designed to target an optimal risk-reward profile without compromising on security, risk controls, or asset quality. It’s built to feel like saving.',
    stats: [
      {
        label: 'APY (7d avg.)',
        value: '6.4%',
        accent: true,
        labelIcon: <Question />,
        // TODO: replace with API value
      },
      {
        label: 'Total TVL',
        value: '$103.2M',
        // TODO: replace with API value
      },
      {
        label: 'My position',
        value: '—',
        muted: true,
        // TODO: replace with wallet position
      },
    ],
    ctaLabel: 'Deposit',
    variant: 'usd' as const,
  },
];

export const NewEarnList: FC = () => {
  const [isDrawerRightOpen, setIsDrawerRightOpen] = useState(false);

  return (
    <>
      <ListWrapper>
        <UpgradeCard setIsDrawerRightOpen={setIsDrawerRightOpen} />
        <CardsStack>
          {VAULTS.map((vault) => (
            <VaultCard
              key={vault.key}
              title={vault.title}
              description={vault.description}
              stats={vault.stats}
              ctaLabel={vault.ctaLabel}
              variant={vault.variant}
              illustration={
                vault.variant === 'eth' ? <EarnEthIcon /> : <EarnUsdIcon />
              }
            />
          ))}
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
