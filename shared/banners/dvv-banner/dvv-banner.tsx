import { BannerTitleText } from '../shared-banner-partials';
import { Button, Link } from '@lidofinance/lido-ui';
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

import { ReactComponent as IconLidoLogo } from 'assets/dvv-banner/dvv-banner-lido-logo.svg';
import { ReactComponent as IconPartnersLogo } from 'assets/dvv-banner/dvv-banner-partners-loogo.svg';

const LINK_DVV_VAULT =
  'https://blog.lido.fi/decentralized-validator-vault-mellow-obol-ssv/';
const LINK_PROCEED_BUTTON =
  'https://app.mellow.finance/vaults/ethereum-dvsteth';

export const DVVBanner = () => {
  return (
    <Wrap>
      <BannerTitleText>New way to support decentralization</BannerTitleText>

      <Description>
        You can stake ETH in <Link href={LINK_DVV_VAULT}>the DVV vault</Link> to
        get stETH rewards, gain points through Obol, SSV, and Mellow, and help
        to decentralize the Lido Protocol.
      </Description>

      <Partners>
        <PartnerItem>
          <PartnerImage>
            <IconLidoLogo />
          </PartnerImage>
          <PartnerText>
            <b>stETH</b> APR
          </PartnerText>
        </PartnerItem>
        <PartnerSeparator>+</PartnerSeparator>
        <PartnerItem>
          <PartnerImage>
            <IconPartnersLogo />
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
          <Link href={LINK_PROCEED_BUTTON}>
            <Button fullwidth size="xs">
              Proceed
            </Button>
          </Link>
        </FooterAction>
      </Footer>
    </Wrap>
  );
};
