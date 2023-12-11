import { ReactNode, FC, PropsWithChildren } from 'react';
import { ContainerProps } from '@lidofinance/lido-ui';

import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Main } from './main/main';
import { LayoutTitleStyle, LayoutSubTitleStyle } from './styles';

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
        <LayoutTitleStyle>{title}</LayoutTitleStyle>
        <LayoutSubTitleStyle>{subtitle}</LayoutSubTitleStyle>
        {children}
      </Main>
      <Footer />
    </>
  );
};
