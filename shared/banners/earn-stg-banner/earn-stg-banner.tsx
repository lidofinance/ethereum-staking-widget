import { EARN_PATH } from 'consts/urls';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_STG_SLUG,
} from 'features/earn/consts';
import { EarnStgBannerIcon } from 'assets/earn';
import { useSTGAvailable } from 'features/earn/vault-stg/hooks/use-stg-available';
import { useSTGStats } from 'features/earn/vault-stg/hooks/use-stg-stats';
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
  Nowrap,
} from './styles';

type EarnStgBannerProps = {
  matomoEvent: MATOMO_CLICK_EVENTS_TYPES;
};

export const EarnStgBanner = (props: EarnStgBannerProps) => {
  const { matomoEvent } = props;
  const bannerLinkHref = `${EARN_PATH}/${EARN_VAULT_STG_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`;
  const { apy } = useSTGStats();
  const { isDepositEnabled } = useSTGAvailable();
  const { closeModal } = useModalActions();

  if (!isDepositEnabled) return null;

  return (
    <Wrap>
      <MessageContainer>
        <Message>
          <span>
            {apy ? (
              <>
                <Nowrap>
                  Earn up to{' '}
                  <FormatPercent value={apy} decimals="percent" fallback="-" />*
                  APY
                </Nowrap>
                <br />
                <Nowrap>with Lido stRATEGY</Nowrap>
              </>
            ) : (
              <>
                <Nowrap>Earn APY</Nowrap>
                <br />
                <Nowrap>with Lido stRATEGY</Nowrap>
              </>
            )}
          </span>
        </Message>
        <LogoContainer>
          <IconWrapper>
            <EarnStgBannerIcon width={184} height={88} />
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
