import {
  Partner7SeasIcon,
  PartnerVedaIcon,
  TokenEthIcon,
  TokenStethIcon,
  TokenWethIcon,
  TokenWstethIcon,
  VaultGGVIcon,
} from 'assets/earn';

import { VaultCard } from '../vaults-list/components/vault-card';
import { EARN_VAULT_GGV_SLUG } from 'consts/urls';
import { useGGVStats } from './hooks/use-ggv-stats';

export const VaultCardGGV = () => {
  const { tvl, apy, isLoading: isLoadingStats } = useGGVStats();
  return (
    <VaultCard
      title="Lido GGV"
      description="Lido GGV leverages top DeFi protocols to maximize rewards on your stETH, with a single deposit."
      urlSlug={EARN_VAULT_GGV_SLUG}
      partners={[
        { role: 'Curated by', icon: <Partner7SeasIcon />, text: '7seas' },
        {
          role: 'Infrastructure provider',
          icon: <PartnerVedaIcon />,
          text: 'Veda',
        },
      ]}
      tokens={[
        { name: 'ETH', logo: <TokenEthIcon /> },
        { name: 'WETH', logo: <TokenWethIcon /> },
        { name: 'stETH', logo: <TokenStethIcon /> },
        { name: 'wstETH', logo: <TokenWstethIcon /> },
      ]}
      stats={{ tvl, apy, isLoading: isLoadingStats }}
      logo={<VaultGGVIcon />}
    />
  );
};
