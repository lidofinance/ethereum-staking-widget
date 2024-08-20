import { BannerTitleText } from '../shared-banner-partials';
import { Button, Link, useThemeToggle } from '@lidofinance/lido-ui';
import {
  Wrap,
  Description,
  Partners,
  PartnerItem,
  PartnerImage,
  PartnerText,
  PartnerSeparator,
  Footer,
  FooterText,
  FooterAction,
} from './styles';

import { ReactComponent as IconLidoLogoLight } from 'assets/dvv-banner/dvv-banner-lido-logo-light.svg';
import { ReactComponent as IconPartnersLogoLight } from 'assets/dvv-banner/dvv-banner-partners-logo-light.svg';
import { ReactComponent as IconLidoLogoDark } from 'assets/dvv-banner/dvv-banner-lido-logo-dark.svg';
import { ReactComponent as IconPartnersLogoDark } from 'assets/dvv-banner/dvv-banner-partners-logo-dark.svg';

import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';

const LINK_DVV_VAULT =
  'https://blog.lido.fi/decentralized-validator-vault-mellow-obol-ssv/';
const LINK_PROCEED_BUTTON =
  'https://app.mellow.finance/vaults/ethereum-dvsteth';

export const DVVBanner = () => {
  const { themeName } = useThemeToggle();
  const isDarkTheme = themeName === 'dark';
  return (
    <Wrap>
      <BannerTitleText>New way to support decentralization</BannerTitleText>

      <Description>
        You can stake ETH in{' '}
        <Link
          href={LINK_DVV_VAULT}
          onClick={() => trackEvent(...MATOMO_CLICK_EVENTS.obolBannerDVVLink)}
        >
          the DVV vault
        </Link>{' '}
        to get stETH rewards, gain points and help to decentralize the Lido
        Protocol
      </Description>

      <Partners>
        <PartnerItem>
          <PartnerImage>
            {isDarkTheme ? <IconLidoLogoDark /> : <IconLidoLogoLight />}
          </PartnerImage>
          <PartnerText>
            <b>stETH</b> APR
          </PartnerText>
        </PartnerItem>
        <PartnerSeparator>+</PartnerSeparator>
        <PartnerItem>
          <PartnerImage>
            {isDarkTheme ? <IconPartnersLogoDark /> : <IconPartnersLogoLight />}
          </PartnerImage>
          <PartnerText>
            <b>Obol</b> + <b>SSV</b> + <b>Mellow</b> Points
          </PartnerText>
        </PartnerItem>
      </Partners>

      <Footer>
        <FooterText>
          Not financial advice. Info and APR are illustrative, actual rewards
          may vary. Vaults use carries risk. By proceeding, you&apos;ll be
          redirected to a third-party site.
        </FooterText>
        <FooterAction>
          <Link
            href={LINK_PROCEED_BUTTON}
            onClick={() => trackEvent(...MATOMO_CLICK_EVENTS.obolBannerProceed)}
          >
            <Button fullwidth size="xs">
              Proceed
            </Button>
          </Link>
        </FooterAction>
      </Footer>
    </Wrap>
  );
};
