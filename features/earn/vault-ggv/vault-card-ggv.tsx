import {
  TokenEthIcon,
  TokenStethIcon,
  TokenWethIcon,
  TokenWstethIcon,
  VaultGGVIcon,
} from 'assets/earn';

import { useDappStatus } from 'modules/web3';

import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_GGV_SLUG } from '../consts';
import { VaultCard } from '../shared/vault-card';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import { useGGVStats } from './hooks/use-ggv-stats';
import { useGGVPosition } from './hooks/use-ggv-position';

import { GGV_PARTNERS, GGV_TOKEN_SYMBOL } from './consts';
import { Link } from '@lidofinance/lido-ui';
import { EARN_PATH } from 'consts/urls';

const ApxHint = () => {
  const link = `${EARN_PATH}/${EARN_VAULT_GGV_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}#what-is-apy-for-ggv`;
  return (
    <span>
      24-hours average APY after{' '}
      <Link target="_self" href={link}>
        fees
      </Link>
      <br />
      <br />
      APY is the annual percentage yield including compounding Learn more in
      Lido GGV FAQ
      <br />
      <br />
      <Link target="_self" href={link}>
        Learn more in Lido GGV FAQ
      </Link>
    </span>
  );
};

export const VaultCardGGV = () => {
  const { isWalletConnected } = useDappStatus();
  const { tvl, apy, isLoading: isLoadingStats } = useGGVStats();
  const { sharesBalance, isLoading: isLoadingPosition } = useGGVPosition();
  return (
    <VaultCard
      title="Lido GGV"
      description="Lido GGV utilizes tried and tested strategies with premiere DeFi protocols for increased rewards on deposits of ETH or (w)stETH."
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
        apxHint: <ApxHint />,
      }}
      logo={<VaultGGVIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvDeposit);
      }}
    />
  );
};
