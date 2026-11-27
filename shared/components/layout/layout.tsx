import { ReactNode, FC, PropsWithChildren, useState } from 'react';
import { TestEnvBanner } from './test-env-banner';
import { FabSlot, FabSlotContext } from './fab-slot';

import type { ContainerProps } from '@lidofinance/lido-ui';

import { config } from 'config';

import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import { AmountBanner } from 'shared/banners/amount-banners';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Main } from './main/main';
import {
  LayoutTitleStyle,
  LayoutSubTitleStyle,
  IPFSInfoBoxOnlyMobileAndPortableWrapper,
  AmountBannerOnlyMobileWrapper,
} from './styles';
import { HolidaysDecorFooter } from '../holiday-decor';

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  containerSize?: ContainerProps['size'];
};

export const Layout: FC<PropsWithChildren<Props>> = (props) => {
  const { title, subtitle, containerSize } = props;
  const { children } = props;
  const [fabSlot, setFabSlot] = useState<HTMLDivElement | null>(null);

  return (
    <FabSlotContext.Provider value={fabSlot}>
      <TestEnvBanner />
      <Header />
      <Main size={containerSize}>
        {config.ipfsMode && (
          <IPFSInfoBoxOnlyMobileAndPortableWrapper>
            <IPFSInfoBox />
          </IPFSInfoBoxOnlyMobileAndPortableWrapper>
        )}
        <AmountBannerOnlyMobileWrapper>
          <AmountBanner isDismissible placement="connect_wallet" />
        </AmountBannerOnlyMobileWrapper>
        <LayoutTitleStyle>{title}</LayoutTitleStyle>
        <LayoutSubTitleStyle>{subtitle}</LayoutSubTitleStyle>
        {children}
      </Main>
      <FabSlot ref={setFabSlot} />
      <Footer />
      <HolidaysDecorFooter />
    </FabSlotContext.Provider>
  );
};
