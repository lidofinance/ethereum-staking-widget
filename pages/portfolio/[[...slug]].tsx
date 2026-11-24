import { FC } from 'react';
import { GetStaticPaths } from 'next';
import Head from 'next/head';

import { config } from 'config';
import { TOKENS } from 'consts/tokens';
import { Portfolio } from 'features/portfolio';
import { parsePortfolioSlug } from 'features/portfolio/utils/route';
import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

type PortfolioPageParams = {
  slug: string[] | undefined;
};

const PortfolioPage: FC = () => {
  return (
    <Layout containerSize="full">
      <Head>
        <title>Portfolio | Lido</title>
        <meta
          name="description"
          content="Track your Lido positions and other holdings in one place."
        />
      </Head>
      <Portfolio />
    </Layout>
  );
};

// known tokens are built ahead; any other token page renders on demand
export const getStaticPaths: GetStaticPaths<
  PortfolioPageParams
> = async () => ({
  paths: [
    { params: { slug: undefined } },
    { params: { slug: ['activity'] } },
    ...Object.values(TOKENS).map((token) => ({
      params: { slug: ['token', token] },
    })),
  ],
  fallback: 'blocking',
});

// the portfolio API is server-only
export const getStaticProps = getDefaultStaticProps<
  Record<string, never>,
  PortfolioPageParams
>('/portfolio', async ({ params }) => {
  if (config.ipfsMode || !parsePortfolioSlug(params?.slug)) {
    return { notFound: true };
  }
  return { props: {} };
});

export default PortfolioPage;
