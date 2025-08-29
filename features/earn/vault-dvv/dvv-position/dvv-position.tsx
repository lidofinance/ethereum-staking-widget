import { parseEther } from 'viem';
import { useDappStatus } from 'modules/web3';

import { VaultPosition } from '../../shared/vault-position';

import { useDVVPosition } from '../hooks/use-dvv-position';
import {
  DVV_TOKEN_SYMBOL,
  MELLOW_POINT_SYMBOL,
  OBOL_TOKEN_SYMBOL,
  SSV_TOKEN_SYMBOL,
} from '../consts';
import {
  TokenDvstethIcon,
  TokenMellowIcon,
  TokenObolIcon,
  TokenSsvIcon,
} from 'assets/earn';
import { ReactComponent as ExternalLinkIcon } from 'assets/icons/external-link-icon.svg';

import { useDVVPoints } from '../hooks/use-dvv-points';
import { ClaimButton } from './styles';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { Link } from '@lidofinance/lido-ui';

const DvvRewardsTip = () => (
  <>
    <p>
      Obol rewards <b>update weekly</b> and must be claimed manually.
    </p>
    <p>
      SSV rewards <b>update monthly</b> and must be claimed manually.
    </p>
    <Link href="https://docs.mellow.finance/points/overview">Learn more</Link>
  </>
);

const DvvPointsTip = () => (
  <p>
    Points are <b>updated every hour</b>.
    <br />
    0.00025 points per hour per 1$.
    <br />
    For more information about how Mellow points work, please visit{' '}
    <Link href="https://docs.mellow.finance/points/overview">
      the Mellow website
    </Link>
  </p>
);

type ClaimDecoratorProps = {
  claimUrl?: string;
  matomoEvent?: MATOMO_EARN_EVENTS_TYPES;
};

const ClaimDecorator = ({ claimUrl, matomoEvent }: ClaimDecoratorProps) => {
  if (!claimUrl) return null;

  return (
    <a href={claimUrl} target="_blank" rel="noopener noreferrer">
      <ClaimButton
        variant="translucent"
        size="sm"
        onClick={() => {
          if (matomoEvent) trackMatomoEvent(matomoEvent);
        }}
      >
        Claim <ExternalLinkIcon />
      </ClaimButton>
    </a>
  );
};

export const DVVPosition = () => {
  const {
    sharesBalance,
    dvvTokenAddress,
    usdBalance,
    isLoading: isLoadingPosition,
  } = useDVVPosition();
  const { data, isLoading: isLoadingPoints } = useDVVPoints();
  const { isDappActive } = useDappStatus();

  if (!isDappActive) return null;

  // convert mellow points to the wei at 18 decimals for easier compatibility with components
  const mellowPointsBalance = parseEther(data?.mellowPoints.toFixed(4) ?? '0');
  return (
    <VaultPosition
      position={{
        symbol: DVV_TOKEN_SYMBOL,
        token: dvvTokenAddress,
        balance: sharesBalance,
        icon: <TokenDvstethIcon />,
        isLoading: isLoadingPosition,
        usdAmount: usdBalance,
      }}
      rewardsTip={<DvvRewardsTip />}
      rewards={[
        {
          symbol: SSV_TOKEN_SYMBOL,
          balance: data?.ssv.claimable,
          token: data?.ssv.token?.address,
          usdAmount: data?.ssv.usdAmount,
          decimals: data?.ssv.token?.decimals,
          isLoading: isLoadingPoints,
          icon: <TokenSsvIcon />,
          rightDecorator: data?.ssv.claimable ? (
            <ClaimDecorator
              claimUrl={data.ssv.claim_url}
              matomoEvent={MATOMO_EARN_EVENTS_TYPES.dvvRewardsClaimSsv}
            />
          ) : undefined,
        },
        {
          symbol: OBOL_TOKEN_SYMBOL,
          balance: data?.obol.claimable,
          token: data?.obol.token?.address,
          decimals: data?.obol.token?.decimals,
          usdAmount: data?.obol.usdAmount,
          isLoading: isLoadingPoints,
          icon: <TokenObolIcon />,
          rightDecorator: data?.obol.claimable ? (
            <ClaimDecorator
              claimUrl={data.obol.claim_url}
              matomoEvent={MATOMO_EARN_EVENTS_TYPES.dvvRewardsClaimObol}
            />
          ) : undefined,
        },
      ]}
      pointsTip={<DvvPointsTip />}
      points={[
        {
          symbol: MELLOW_POINT_SYMBOL,
          balance: mellowPointsBalance,
          usdAmount: null,
          isLoading: isLoadingPoints,
          icon: <TokenMellowIcon />,
        },
      ]}
    />
  );
};
