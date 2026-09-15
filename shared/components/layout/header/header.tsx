import { FC } from 'react';
import { LogoLido } from 'shared/components/logos/logos';
import { HolidaysDecorHeader } from 'shared/components/holiday-decor';

import { MobileSliderNavigation, Navigation } from './components/navigation';
import { HeaderWallet } from './components/header-wallet';

import { HeaderStyle, HeaderActionsStyle } from './styles';

export const Header: FC = () => (
  <>
    <HeaderStyle size="full" forwardedAs="header">
      <LogoLido />
      <Navigation />
      <HeaderActionsStyle>
        <HeaderWallet />
      </HeaderActionsStyle>
      <HolidaysDecorHeader />
    </HeaderStyle>
    <MobileSliderNavigation />
  </>
);
