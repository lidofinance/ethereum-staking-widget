import React from 'react';
import Head from 'next/head';
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
      <Head>
        <meta name="description" content="Lido Template" />
      </Head>
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
