/* ============================================================
 * 🚫 NOTICE 🚫
 * ------------------------------------------------------------
 * This banner is hidden since the Earn page release.
 * ============================================================
 */

import { Button, Link, useThemeToggle } from '@lidofinance/lido-ui';
import { BannerTitleText } from '../shared-banner-partials';
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
  Loader,
} from './styles';

import { ReactComponent as IconMellowLogo } from 'assets/dvv-banner/dvv-banner-mellow-logo.svg';
import { ReactComponent as IconPartnersLogoLight } from 'assets/dvv-banner/dvv-banner-partners-logo-light.svg';
import { ReactComponent as IconPartnersLogoDark } from 'assets/dvv-banner/dvv-banner-partners-logo-dark.svg';

import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo';
import { useDVstEthApr } from 'shared/hooks/useDVstEthApr';

const LINK_PROCEED_BUTTON =
  'https://app.mellow.finance/vaults/ethereum-dvsteth';

export const DVVBanner = () => {
  const { themeName } = useThemeToggle();
  const isDarkTheme = themeName === 'dark';
  const { apr: DVstEthApr, isPending, isError } = useDVstEthApr();
  const apr = isError ? '' : `${DVstEthApr}%`;

  return (
    <Wrap>
      <BannerTitleText>
        <b>Total {isPending ? <Loader /> : apr} APR</b> + Mellow points
      </BannerTitleText>

      <Description>New way to support Lido decentralization.</Description>

      <Partners>
        <PartnerItem>
          <PartnerImage>
            {isDarkTheme ? <IconPartnersLogoDark /> : <IconPartnersLogoLight />}
          </PartnerImage>
          <PartnerText>
            stETH, Obol, SSV <b>APR</b>
          </PartnerText>
        </PartnerItem>
        <PartnerSeparator>+</PartnerSeparator>
        <PartnerItem>
          <PartnerImage>
            <IconMellowLogo />
          </PartnerImage>
          <PartnerText>
            <b>Mellow points</b>
          </PartnerText>
        </PartnerItem>
      </Partners>

      <Footer>
        <FooterText>
          Not financial advice. Info and APR are illustrative, actual rewards
          may vary. Vaults use carries risk. By proceeding, you&apos;ll&nbsp;be
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
