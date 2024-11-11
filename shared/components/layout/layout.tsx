import { ReactNode, FC, PropsWithChildren } from 'react';

import { ContainerProps } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';
import { useRouterPath } from 'shared/hooks/use-router-path';

import { config, useConfig } from 'config';
import { ManifestConfigPage } from 'config/external-config';
import { HOME_PATH } from 'consts/urls';

import { LayoutEffectSsrDelayed } from 'shared/components/layout-effect-ssr-delayed';
import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Main } from './main/main';
import {
  LayoutTitleStyle,
  LayoutSubTitleStyle,
  IPFSInfoBoxOnlyMobileAndPortableWrapper,
} from './styles';

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  containerSize?: ContainerProps['size'];
};

export const Layout: FC<PropsWithChildren<Props>> = (props) => {
  const { title, subtitle, containerSize } = props;
  const { children } = props;
  const router = useRouter();
  const path = useRouterPath();
  const { pages } = useConfig().externalConfig;

  const checkPathEffect = () => {
    if (pages) {
      const paths = Object.keys(pages) as ManifestConfigPage[];
      const forbiddenPath = paths.find((pathKey) => path.includes(pathKey));
      if (forbiddenPath && pages[forbiddenPath]?.deactivate) {
        void router.push(HOME_PATH);
      }
    }
  };

  return (
    <>
      <Header />
      <LayoutEffectSsrDelayed effect={checkPathEffect} deps={[pages]} />
      <Main size={containerSize}>
        {config.ipfsMode && (
          <IPFSInfoBoxOnlyMobileAndPortableWrapper>
            <IPFSInfoBox />
          </IPFSInfoBoxOnlyMobileAndPortableWrapper>
        )}
        <LayoutTitleStyle>{title}</LayoutTitleStyle>
        <LayoutSubTitleStyle>{subtitle}</LayoutSubTitleStyle>
        {children}
      </Main>
      <Footer />
    </>
  );
};
