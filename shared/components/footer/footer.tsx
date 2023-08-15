import { FC } from 'react';
import { version } from 'build-info.json';

import {
  FooterStyle,
  FooterLink,
  LogoLidoStyle,
  FooterDivider,
  Version,
  LinkDivider,
} from './styles';

const widgetVersion =
  version === 'REPLACE_WITH_VERSION' ? 'dev' : `v${version}`;

export const Footer: FC = () => (
  <FooterStyle size="full" forwardedAs="footer">
    <LogoLidoStyle />
    <FooterLink data-testid="termsOfUse" href="https://lido.fi/terms-of-use">
      Terms of Use
    </FooterLink>
    <LinkDivider />
    <FooterLink
      data-testid="privacyNotice"
      href="https://lido.fi/privacy-notice"
    >
      Privacy Notice
    </FooterLink>
    <Version
      href={`https://github.com/lidofinance/ethereum-staking-widget/releases/${version}`}
    >
      {widgetVersion}
    </Version>
    <FooterDivider />
  </FooterStyle>
);
