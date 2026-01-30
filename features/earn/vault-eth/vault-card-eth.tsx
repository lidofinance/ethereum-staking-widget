import { Question } from '@lidofinance/lido-ui';
import { EarnEthIcon } from 'assets/earn-new';

import { VaultCard } from '../shared/vault-card-v2';
import { EARN_VAULT_ETH_SLUG } from '../consts';

export const VaultCardETH = () => {
  const stats = [
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
  ];

  return (
    <VaultCard
      title="Lido Earn ETH"
      description="Lido Earn ETH vault utilizes tried and tested strategies with premier DeFi protocols for increased rewards on deposits of ETH or stETH."
      urlSlug={EARN_VAULT_ETH_SLUG}
      stats={stats}
      ctaLabel={'Deposit'}
      variant={'eth'}
      illustration={<EarnEthIcon />}
    />
  );
};
