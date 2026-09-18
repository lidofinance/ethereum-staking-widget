import { FC } from 'react';
import { LogoLido } from 'shared/components/logos/logos';
import { HolidaysDecorHeader } from 'shared/components/holiday-decor';

import { MobileSliderNavigation, Navigation } from './components/navigation';
import { HeaderActions } from './components/header-actions';

import { HeaderStyled } from './styles';

export const Header: FC = () => (
  <>
    <HeaderStyled size="full" forwardedAs="header">
      <LogoLido />
      <Navigation />
      <HeaderActions />
      <HolidaysDecorHeader />
    </HeaderStyled>
    <MobileSliderNavigation />
  </>
);
