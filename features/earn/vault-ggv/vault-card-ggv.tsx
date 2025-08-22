import {
  Partner7SeasIcon,
  PartnerVedaIcon,
  TokenEthIcon,
  TokenStethIcon,
  TokenWethIcon,
  TokenWstethIcon,
  VaultGGVIcon,
} from 'assets/earn';

import { useDappStatus } from 'modules/web3';

import { EARN_VAULT_GGV_SLUG } from '../consts';
import { VaultCard } from '../shared/vault-card';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import { useGGVStats } from './hooks/use-ggv-stats';
import { useGGVPosition } from './hooks/use-ggv-position';
import { GGV_TOKEN_SYMBOL } from './consts';

export const VaultCardGGV = () => {
  const { isWalletConnected } = useDappStatus();
  const { tvl, apy, isLoading: isLoadingStats } = useGGVStats();
  const { sharesBalance, isLoading: isLoadingPosition } = useGGVPosition();
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
      position={
        isWalletConnected
          ? {
              balance: sharesBalance,
              symbol: GGV_TOKEN_SYMBOL,
              isLoading: isLoadingPosition,
            }
          : undefined
      }
      stats={{ tvl, apy, isLoading: isLoadingStats }}
      logo={<VaultGGVIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvDeposit);
      }}
    />
  );
};
