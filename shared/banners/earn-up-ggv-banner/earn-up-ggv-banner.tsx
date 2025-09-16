import { EARN_PATH } from 'consts/urls';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_GGV_SLUG,
} from 'features/earn/consts';
import { EarnGgvBannerIcon } from 'assets/earn';
import { useGGVStats } from 'features/earn/vault-ggv/hooks/use-ggv-stats';
import { useGGVAvailable } from 'features/earn/vault-ggv/hooks/use-ggv-available';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { FormatPercent } from 'shared/formatters/format-percent';
import { useModalActions } from 'providers/modal-provider';

import {
  Message,
  MessageContainer,
  LogoContainer,
  OverlayLink,
  Wrap,
  IconWrapper,
} from './styles';

type EarnUpGGVBannerProps = {
  matomoEvent: MATOMO_CLICK_EVENTS_TYPES;
};

export const EarnUpGGVBanner = (props: EarnUpGGVBannerProps) => {
  const { matomoEvent } = props;
  const bannerLinkHref = `${EARN_PATH}/${EARN_VAULT_GGV_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`;
  const { apy } = useGGVStats();
  const { isDepositEnabled } = useGGVAvailable();
  const { closeModal } = useModalActions();

  if (!isDepositEnabled) return null;

  return (
    <Wrap>
      <MessageContainer>
        <Message>
          <span>
            {apy ? (
              <>
                Earn up to{' '}
                <FormatPercent value={apy} decimals="percent" fallback="-" />{' '}
                {/* eslint-disable-next-line no-irregular-whitespace */}
                APY with Lido GGV
              </>
            ) : (
              'Earn APY with Lido GGV'
            )}
          </span>
        </Message>
        <LogoContainer>
          <IconWrapper>
            <EarnGgvBannerIcon width={136} height={119} />
          </IconWrapper>
        </LogoContainer>
      </MessageContainer>
      <OverlayLink
        href={bannerLinkHref}
        onClick={() => {
          trackMatomoEvent(matomoEvent);
          closeModal();
        }}
      />
    </Wrap>
  );
};
