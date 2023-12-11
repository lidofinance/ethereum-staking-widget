import { ReactNode, FC, PropsWithChildren } from 'react';

import { ContainerProps } from '@lidofinance/lido-ui';

import { dynamics } from 'config';
import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import { Header, Footer, Main } from 'shared/components';

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

  return (
    <>
      <Header />
      <Main size={containerSize}>
        {dynamics.ipfsMode && (
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
