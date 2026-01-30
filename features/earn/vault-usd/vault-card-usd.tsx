import { Question } from '@lidofinance/lido-ui';
import { EarnUsdIcon } from 'assets/earn-new';

import { VaultCard } from '../shared/vault-card-v2';
import { EARN_VAULT_USD_SLUG } from '../consts';

export const VaultCardUSD = () => {
  const stats = [
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
  ];

  return (
    <VaultCard
      title="Lido Earn USD"
      description="Lido Earn USD Vault is curated for USD-denominated assets, designed to target an optimal risk-reward profile without compromising on security, risk controls, or asset quality. It’s built to feel like saving."
      urlSlug={EARN_VAULT_USD_SLUG}
      stats={stats}
      ctaLabel={'Deposit'}
      variant={'usd'}
      illustration={<EarnUsdIcon />}
    />
  );
};
