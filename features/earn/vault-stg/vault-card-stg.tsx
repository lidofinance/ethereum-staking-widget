import {
  TokenEthIcon,
  TokenWethIcon,
  TokenWstethIcon,
  VaultSTGIcon,
  TokenStrethIcon,
} from 'assets/earn';

import { useDappStatus } from 'modules/web3';
import { useSTGStats } from './hooks/use-stg-stats';
import { useSTGPosition } from './hooks/use-stg-position';
import { VaultCard } from '../shared/vault-card';
import { EARN_VAULT_STG_SLUG } from '../consts';
import {
  STG_VAULT_DESCRIPTION,
  STG_PARTNERS,
  STG_TOKEN_SYMBOL,
} from './consts';
import { STGApyHint } from './components/stg-apy-hint';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { useDepositRequests } from './deposit/hooks';

export const VaultCardSTG = () => {
  const { isWalletConnected } = useDappStatus();
  const { tvl, apy, isLoading: isLoadingStats } = useSTGStats();
  const { strethSharesBalance, isLoading: isLoadingPosition } =
    useSTGPosition();
  const { totalClaimableStrethShares, isLoading: isLoadingDepositRequests } =
    useDepositRequests();

  return (
    <VaultCard
      title="Lido stRATEGY"
      description={STG_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_STG_SLUG}
      partners={STG_PARTNERS}
      tokens={[
        { name: 'ETH', logo: <TokenEthIcon /> },
        { name: 'WETH', logo: <TokenWethIcon /> },
        { name: 'wstETH', logo: <TokenWstethIcon /> },
      ]}
      position={
        isWalletConnected
          ? {
              balance: strethSharesBalance,
              toBeClaimed: totalClaimableStrethShares,
              symbol: STG_TOKEN_SYMBOL,
              isLoading: isLoadingPosition || isLoadingDepositRequests,
              logo: <TokenStrethIcon width={16} height={16} />,
            }
          : undefined
      }
      stats={{
        tvl,
        apx: apy,
        apxLabel: 'APY',
        apxHint: <STGApyHint />,
        isLoading: isLoadingStats,
      }}
      logo={<VaultSTGIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDeposit);
      }}
    />
  );
};
