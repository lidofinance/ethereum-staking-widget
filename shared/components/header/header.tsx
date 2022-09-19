import { FC } from 'react';
import Link from 'next/link';
import { LidoLogo } from '@lidofinance/lido-ui';
import { Navigation } from './components/navigation/navigation';
import { HeaderStyle, HeaderLogoStyle, HeaderActionsStyle } from './styles';
import HeaderWallet from './components/header-wallet';

export const Header: FC = () => (
  <HeaderStyle size="full" forwardedAs="header">
    <HeaderLogoStyle>
      <Link href="/">
        <LidoLogo />
      </Link>
    </HeaderLogoStyle>
    <Navigation />
    <HeaderActionsStyle>
      <HeaderWallet />
    </HeaderActionsStyle>
  </HeaderStyle>
);
