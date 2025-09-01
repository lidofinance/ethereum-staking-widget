import { TokenEthIcon, TokenWethIcon, VaultDDVIcon } from 'assets/earn';
import { useDappStatus } from 'modules/web3';

import { VaultCard } from '../shared/vault-card';
import { EARN_VAULT_DVV_SLUG } from '../consts';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { useDVVStats } from './hooks/use-dvv-stats';
import { useDVVPosition } from './hooks/use-dvv-position';
import { DVV_PARTNERS, DVV_TOKEN_SYMBOL } from './consts';
import { DVVAprBreakdown } from './dvv-apr-breakdown';

export const VaultCardDVV = () => {
  const { isWalletConnected } = useDappStatus();
  const { tvl, apr, isLoading: isLoadingStats } = useDVVStats();
  const { sharesBalance, isLoading: isLoadingPosition } = useDVVPosition();
  return (
    <VaultCard
      title="Lido DVV"
      description="Lido DVV provides staking rewards boosted by Distributed Validator Technology (DVT) provider incentives while supporting Node Operator decentralization."
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
      logo={<VaultDDVIcon />}
      position={
        isWalletConnected
          ? {
              symbol: DVV_TOKEN_SYMBOL,
              balance: sharesBalance,
              isLoading: isLoadingPosition,
            }
          : undefined
      }
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.dvvDeposit);
      }}
    />
  );
};
