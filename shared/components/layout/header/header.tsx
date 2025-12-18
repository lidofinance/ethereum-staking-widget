import { FC } from 'react';

import { LogoLido } from 'shared/components/logos/logos';
import { HolidaysDecorHeader } from 'shared/components/holiday-decor';

import { Navigation } from './components/navigation/navigation';
import { HeaderStyle, HeaderActionsStyle } from './styles';
import HeaderWallet from './components/header-wallet';

export const Header: FC = () => (
  <HeaderStyle size="full" forwardedAs="header">
    <LogoLido />
    <Navigation />
    <HeaderActionsStyle>
      <HeaderWallet />
    </HeaderActionsStyle>
    <HolidaysDecorHeader />
  </HeaderStyle>
);
