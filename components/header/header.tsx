import { FC } from 'react';
import {
  HeaderStyle,
  HeaderLogoStyle,
  HeaderActionsStyle,
} from './headerStyles';
import Logo from 'components/logo';
import HeaderWallet from './headerWallet';
import Navigation from 'components/navigation';

const Header: FC = () => (
  <HeaderStyle size="full" forwardedAs="header">
    <HeaderLogoStyle>
      <Logo />
    </HeaderLogoStyle>
    <Navigation />
    <HeaderActionsStyle>
      <HeaderWallet />
    </HeaderActionsStyle>
  </HeaderStyle>
);

export default Header;
