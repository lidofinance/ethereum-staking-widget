import { Button, Link } from '@lidofinance/lido-ui';

import { EARN_PATH } from 'consts/urls';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_DVV_SLUG,
} from 'features/earn/consts';
import { VaultGGVIcon } from 'assets/earn';
import { useGGVStats } from 'features/earn/vault-ggv/hooks/use-ggv-stats';
import { useGGVAvailable } from 'features/earn/vault-ggv/hooks/use-ggv-available';
import { useIsEarnDisabled } from 'features/earn/shared/hooks/use-is-earn-disabled';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';

import { BannerWrap } from '../shared-banner-partials';
import { Message, Highlight, MessageContainer, LogoContainer } from './styles';

export const EarnGGVBanner = () => {
  const bannerLinkHref = `${EARN_PATH}/${EARN_VAULT_DVV_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`;
  const { apy } = useGGVStats();

  const isEarnDisabled = useIsEarnDisabled();
  const { isGGVAvailable, isDepositEnabled } = useGGVAvailable();

  if (isEarnDisabled || !isGGVAvailable || !isDepositEnabled) return null;

  return (
    <BannerWrap>
      <MessageContainer>
        <Message>
          <span>
            Earn <Highlight>up to {apy}%</Highlight> of additional APY with Lido
            GGV.
          </span>
        </Message>
        <LogoContainer>
          <VaultGGVIcon viewBox="2 3 47 47" width={94} height={94} />
        </LogoContainer>
      </MessageContainer>
      <Link
        href={bannerLinkHref}
        onClick={() =>
          trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.startEarningGGV)
        }
      >
        <Button size="sm" fullwidth>
          Start earning
        </Button>
      </Link>
    </BannerWrap>
  );
};
