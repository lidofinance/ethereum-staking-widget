import {
  TokenEthIcon,
  TokenWethIcon,
  VaultDVVIcon,
  TokenDvstethIcon,
} from 'assets/earn';
import { useDappStatus } from 'modules/web3';

import { VaultCard } from '../shared/vault-card';
import { EARN_VAULT_DVV_SLUG } from '../consts';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { useDVVStats } from './hooks/use-dvv-stats';
import { useDVVPosition } from './hooks/use-dvv-position';
import {
  DVV_PARTNERS,
  DVV_TOKEN_SYMBOL,
  DVV_VAULT_DESCRIPTION,
} from './consts';
import { DVVAprBreakdown } from './components/dvv-apr-breakdown';

export const VaultCardDVV = () => {
  const { isWalletConnected } = useDappStatus();
  const { tvl, apr, isLoading: isLoadingStats } = useDVVStats();
  const { sharesBalance, isLoading: isLoadingPosition } = useDVVPosition();
  return (
    <VaultCard
      title="Lido DVV"
      description={DVV_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_DVV_SLUG}
      partners={DVV_PARTNERS}
      tokens={[
        { name: 'ETH', logo: <TokenEthIcon /> },
        { name: 'WETH', logo: <TokenWethIcon /> },
      ]}
      stats={{
        tvl,
        apx: apr,
        apxLabel: 'APR',
        isLoading: isLoadingStats,
        apxHint: <DVVAprBreakdown />,
      }}
      logo={<VaultDVVIcon />}
      position={
        isWalletConnected
          ? {
              symbol: DVV_TOKEN_SYMBOL,
              balance: sharesBalance,
              isLoading: isLoadingPosition,
              logo: (
                <TokenDvstethIcon width={16} height={16} viewBox="0 0 28 28" />
              ),
            }
          : undefined
      }
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.dvvDeposit);
      }}
    />
  );
};
