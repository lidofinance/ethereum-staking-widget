import React from 'react';
import { ContainerProps } from '@lidofinance/lido-ui';
import { Header, Footer, Main } from 'shared/components';
import { LayoutTitleStyle, LayoutSubTitleStyle } from './styles';

type Props = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  containerSize?: ContainerProps['size'];
};

export const Layout: React.FC<Props> = (props) => {
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
