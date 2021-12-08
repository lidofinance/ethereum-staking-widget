import React from 'react';
import { Header, Footer, Main } from 'shared/components';
import { LayoutTitleStyle, LayoutSubTitleStyle } from './styles';

type Props = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
};

export const Layout: React.FC<Props> = (props) => {
  const { title, subtitle } = props;
  const { children } = props;

  return (
    <>
      <Header />
      <Main>
        <LayoutTitleStyle>{title}</LayoutTitleStyle>
        <LayoutSubTitleStyle>{subtitle}</LayoutSubTitleStyle>
        {children}
      </Main>
      <Footer />
    </>
  );
};
