import { VaultStgIcon } from 'assets/earn-v2';
import { useDappStatus } from 'modules/web3';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { useSTGApy } from './hooks/use-stg-apy';
import { useSTGStats } from './hooks/use-stg-stats';
import { useSTGPosition } from './hooks/use-stg-position';
import { VaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_STG_SLUG } from '../consts';
import { STGApyHint } from './components/stg-apy-hint';
import { useDepositRequests } from './deposit/hooks';
import { STG_VAULT_DESCRIPTION, STG_TOKEN_SYMBOL } from './consts';

export const VaultCardSTG = () => {
  const { isWalletConnected } = useDappStatus();
  const { totalTvlUsd, isLoading: isLoadingTvlUsd } = useSTGStats();
  const { apy, isLoading: isLoadingApy } = useSTGApy();
  const { strethSharesBalance, isLoading: isLoadingPosition } =
    useSTGPosition();
  const {
    totalClaimableStrethShares,
    pendingRequests,
    isLoading: isLoadingDepositRequests,
  } = useDepositRequests();

  const pending = pendingRequests.map((request) => ({
    tokenSymbol: request.token,
    amount: request.assets,
  }));

  return (
    <VaultCard
      title="Lido stRATEGY"
      description={STG_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_STG_SLUG}
      stats={{
        tvl: totalTvlUsd,
        apx: apy,
        apxLabel: 'APY',
        apxHint: <STGApyHint />,
        isLoading: isLoadingApy || isLoadingTvlUsd,
      }}
      position={
        isWalletConnected
          ? {
              balance: strethSharesBalance,
              symbol: STG_TOKEN_SYMBOL,
              claimable: totalClaimableStrethShares,
              pending,
              isLoading: isLoadingPosition || isLoadingDepositRequests,
            }
          : undefined
      }
      ctaLabel={'Upgrade your assets'}
      illustration={<VaultStgIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDeposit);
      }}
    />
  );
};
