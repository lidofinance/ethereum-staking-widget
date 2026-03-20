import { ReactNode, FC, PropsWithChildren } from 'react';
import { ContainerProps } from '@lidofinance/lido-ui';

import { config } from 'config';

import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import {
  WhaleBanner,
  useWhaleBannerOnConnectVisibility,
} from 'features/whale-banners';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Main } from './main/main';
import {
  LayoutTitleStyle,
  LayoutSubTitleStyle,
  IPFSInfoBoxOnlyMobileAndPortableWrapper,
  WhaleBannerOnlyMobileWrapper,
} from './styles';
import { HolidaysDecorFooter } from '../holiday-decor';

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  containerSize?: ContainerProps['size'];
  stylesV2?: boolean;
};

export const Layout: FC<PropsWithChildren<Props>> = (props) => {
  const { title, subtitle, containerSize, stylesV2 } = props;
  const { children } = props;

  const {
    shouldShow: shouldShowWhaleBanner,
    bannerConfig: whaleBannerConfig,
    dismiss: dismissWhaleBanner,
  } = useWhaleBannerOnConnectVisibility();

  return (
    <>
      <Header />
      <Main size={containerSize}>
        {config.ipfsMode && (
          <IPFSInfoBoxOnlyMobileAndPortableWrapper>
            <IPFSInfoBox />
          </IPFSInfoBoxOnlyMobileAndPortableWrapper>
        )}
        <WhaleBannerOnlyMobileWrapper>
          {shouldShowWhaleBanner && whaleBannerConfig && (
            <WhaleBanner
              config={whaleBannerConfig}
              onDismiss={dismissWhaleBanner}
            />
          )}
        </WhaleBannerOnlyMobileWrapper>
        <LayoutTitleStyle $v2={stylesV2}>{title}</LayoutTitleStyle>
        <LayoutSubTitleStyle>{subtitle}</LayoutSubTitleStyle>
        {children}
      </Main>
      <Footer />
      <HolidaysDecorFooter />
    </>
  );
};
