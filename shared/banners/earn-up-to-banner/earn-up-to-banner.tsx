import { EARN_PATH } from 'consts/urls';
import { EarnUpToBannerIcon } from 'assets/earn';
import { useSTGAvailable } from 'features/earn/vault-stg/hooks/use-stg-available';
import { useEarnVaultsApr } from 'shared/hooks/use-earn-vaults-apr';
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
  InnerContainer,
} from './styles';

type EarnUpToBannerProps = {
  matomoEvent: MATOMO_CLICK_EVENTS_TYPES;
};

export const EarnUpToBanner = (props: EarnUpToBannerProps) => {
  const { matomoEvent } = props;
  const bannerLinkHref = EARN_PATH;

  const { closeModal } = useModalActions();

  const { maxValue } = useEarnVaultsApr();
  const { isDepositEnabled } = useSTGAvailable();

  if (!isDepositEnabled) return null;

  return (
    <Wrap>
      <InnerContainer>
        <MessageContainer>
          <Message>
            <span>
              {maxValue ? (
                <>
                  <Nowrap>
                    Earn up to{' '}
                    <FormatPercent value={maxValue} decimals="percent" />* APY
                  </Nowrap>
                  <br />
                  <Nowrap>with Lido Earn</Nowrap>
                </>
              ) : (
                <>
                  <Nowrap>Earn APY</Nowrap>
                  <br />
                  <Nowrap>with Lido Earn</Nowrap>
                </>
              )}
            </span>
          </Message>
        </MessageContainer>
        <LogoContainer>
          <IconWrapper>
            <EarnUpToBannerIcon width={114} height={88} />
          </IconWrapper>
        </LogoContainer>
      </InnerContainer>
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
