import { FC } from 'react';

import {
  FooterStyle,
  FooterLink,
  LogoLidoStyle,
  FooterDivider,
} from './styles';

export const Footer: FC = () => (
  <FooterStyle size="full" forwardedAs="footer">
    <LogoLidoStyle />
    <FooterLink data-testid="termsOfUse" href="https://lido.fi/terms-of-use">
      Terms of Use
    </FooterLink>
    <FooterLink
      data-testid="privacyNotice"
      href="https://lido.fi/privacy-notice"
    >
      Privacy Notice
    </FooterLink>
    <FooterDivider />
  </FooterStyle>
);
