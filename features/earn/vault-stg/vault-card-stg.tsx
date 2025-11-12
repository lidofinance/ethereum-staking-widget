import {
  TokenEthScalableIcon,
  TokenWethScalableIcon,
  TokenWstethScalableIcon,
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
  const {
    totalClaimableStrethShares,
    pendingRequests,
    isLoading: isLoadingDepositRequests,
  } = useDepositRequests();

  const depositTokens = [
    { name: 'ETH', logo: <TokenEthScalableIcon /> },
    { name: 'WETH', logo: <TokenWethScalableIcon /> },
    { name: 'wstETH', logo: <TokenWstethScalableIcon /> },
  ];

  const pending = pendingRequests.map((request) => ({
    tokenSymbol: request.token,
    amount: request.assets,
  }));

  return (
    <VaultCard
      title="Lido stRATEGY"
      description={STG_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_STG_SLUG}
      partners={STG_PARTNERS}
      tokens={depositTokens}
      position={
        isWalletConnected
          ? {
              balance: strethSharesBalance,
              symbol: STG_TOKEN_SYMBOL,
              logo: <TokenStrethIcon />,
              claimable: totalClaimableStrethShares,
              pending,
              isLoading: isLoadingPosition || isLoadingDepositRequests,
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
