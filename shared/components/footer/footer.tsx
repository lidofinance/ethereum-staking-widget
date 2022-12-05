import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { FooterStyle, FooterGroupStyle, FooterItemStyle } from './styles';

export const Footer: FC = () => (
  <FooterStyle size="full" forwardedAs="footer">
    <FooterGroupStyle>
      <FooterItemStyle>
        <Link href="https://lido.fi/terms-of-use">Terms of Use</Link>
      </FooterItemStyle>
      <FooterItemStyle>
        <Link href="https://lido.fi/privacy-notice">Privacy Notice</Link>
      </FooterItemStyle>
    </FooterGroupStyle>
  </FooterStyle>
);
