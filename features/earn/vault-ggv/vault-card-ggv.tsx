import {
  TokenEthIcon,
  TokenStethIcon,
  TokenWethIcon,
  TokenWstethIcon,
  VaultGGVIcon,
} from 'assets/earn';

import { useDappStatus } from 'modules/web3';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import { EARN_VAULT_GGV_SLUG } from '../consts';
import { VaultCard } from '../shared/vault-card';
import { useGGVStats } from './hooks/use-ggv-stats';
import { useGGVPosition } from './hooks/use-ggv-position';
import { GGV_PARTNERS, GGV_TOKEN_SYMBOL } from './consts';
import { GGVApyHint } from './ggv-apy-hint';

export const VaultCardGGV = () => {
  const { isWalletConnected } = useDappStatus();
  const { tvl, apy, isLoading: isLoadingStats } = useGGVStats();
  const { sharesBalance, isLoading: isLoadingPosition } = useGGVPosition();
  return (
    <VaultCard
      title="Lido GGV"
      description="Lido GGV utilizes tried and tested strategies with premier DeFi protocols for increased rewards on deposits of ETH or (w)stETH."
      urlSlug={EARN_VAULT_GGV_SLUG}
      partners={GGV_PARTNERS}
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
      stats={{
        tvl,
        apx: apy,
        apxLabel: 'APY',
        isLoading: isLoadingStats,
        apxHint: <GGVApyHint />,
      }}
      logo={<VaultGGVIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvDeposit);
      }}
    />
  );
};
