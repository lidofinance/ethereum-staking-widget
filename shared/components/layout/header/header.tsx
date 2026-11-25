import { FC } from 'react';
import { LogoLido } from 'shared/components/logos/logos';
import { WinterGarland, WinterLogoHat } from 'shared/components/winter-theme';

import { MobileNavigation, Navigation } from './components/navigation';
import { HeaderActions } from './components/header-actions';

import { HeaderStyled, LogoWrap } from './styles';

export const Header: FC = () => (
  <>
    <HeaderStyled size="full" forwardedAs="header">
      <LogoWrap>
        <LogoLido />
        <WinterLogoHat />
      </LogoWrap>
      <Navigation />
      <HeaderActions />
    </HeaderStyled>
    <WinterGarland />
    <MobileNavigation />
  </>
);
