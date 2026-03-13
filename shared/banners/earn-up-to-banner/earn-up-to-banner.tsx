import { EARN_PATH } from 'consts/urls';
import { EARN_VAULT_ETH_SLUG } from 'features/earn/consts';
import { VaultEthIcon } from 'assets/earn-v2';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { FormatPercent } from 'shared/formatters/format-percent';
import { useModalActions } from 'providers/modal-provider';
import { useEarnBannerState } from 'features/earn/shared/hooks/use-earn-banner-state';
import { useEthVaultApy } from 'features/earn/vault-eth/hooks/use-vault-apy';

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
  placement?: 'stakeForm' | 'afterStake';
};

export const EarnUpToBanner = (props: EarnUpToBannerProps) => {
  const { matomoEvent } = props;

  const { showOnStakeForm, showAfterStake } = useEarnBannerState();

  const { closeModal } = useModalActions();

  const { apy } = useEthVaultApy();

  if (
    (props.placement === 'stakeForm' && !showOnStakeForm) ||
    (props.placement === 'afterStake' && !showAfterStake)
  ) {
    return null;
  }

  return (
    <Wrap>
      <InnerContainer>
        <MessageContainer>
          <Message>
            <span>
              {apy ? (
                <>
                  <Nowrap>
                    Earn up to <FormatPercent value={apy} decimals="percent" />{' '}
                    APY*
                  </Nowrap>
                  <br />
                  <Nowrap>with EarnETH</Nowrap>
                </>
              ) : (
                <>
                  <Nowrap>Earn APY*</Nowrap>
                  <br />
                  <Nowrap>with EarnETH</Nowrap>
                </>
              )}
            </span>
          </Message>
        </MessageContainer>
        <LogoContainer>
          <IconWrapper>
            <VaultEthIcon width={140} height={140} />
          </IconWrapper>
        </LogoContainer>
      </InnerContainer>
      <OverlayLink
        href={`${EARN_PATH}/${EARN_VAULT_ETH_SLUG}`}
        onClick={() => {
          trackMatomoEvent(matomoEvent);
          closeModal();
        }}
      />
    </Wrap>
  );
};
