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
  const { isWalletConnected } = useDappStatus();

  if (!isWalletConnected) return null;

  // convert mellow points to the wei at 18 decimals
  const mellowPointsBalance =
    BigInt(Math.floor((data?.mellowPoints ?? 0) * 10 ** 4)) * 10n ** 14n;

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
