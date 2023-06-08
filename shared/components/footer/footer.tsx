import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';

import {
  FooterStyle,
  FooterItemStyle,
  LogoLidoStyle,
  FooterDivider,
} from './styles';

export const Footer: FC = () => (
  <FooterStyle size="full" forwardedAs="footer">
    <LogoLidoStyle />
    <FooterItemStyle>
      <Link href="https://lido.fi/terms-of-use">Terms of Use</Link>
    </FooterItemStyle>
    <FooterItemStyle>
      <Link href="https://lido.fi/privacy-notice">Privacy Notice</Link>
    </FooterItemStyle>
    <FooterDivider />
  </FooterStyle>
);
