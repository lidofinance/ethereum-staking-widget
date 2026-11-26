import type { FC } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { Layout } from 'shared/components';
import { SupportL1andL2StakingChains } from 'modules/web3';

import {
  STAKE_PATHS,
  StakeV2,
  parseStakeSegments,
  toStakeSegments,
  type StakePath,
} from 'features/stake-v2';

type StakePageProps = {
  path: StakePath;
};

type StakePageParams = {
  slug: string[] | undefined;
};

const StakePage: FC<StakePageProps> = ({ path }) => {
  return (
    <SupportL1andL2StakingChains>
      <Layout stylesV2 containerSize="content">
        <Head>
          <title>Stake | Lido</title>
        </Head>
        <StakeV2 path={path} />
      </Layout>
    </SupportL1andL2StakingChains>
  );
};

export default StakePage;

// every page is known ahead, so the static IPFS export gets them all
export const getStaticPaths: GetStaticPaths<StakePageParams> = async () => ({
  paths: STAKE_PATHS.map((path) => ({
    params: { slug: toStakeSegments(path) },
  })),
  fallback: false, // return 404 on non match
});

// [[...slug]] covers /stake itself and every page below it
export const getStaticProps: GetStaticProps<
  StakePageProps,
  StakePageParams
> = async ({ params }) => {
  const path = parseStakeSegments(params?.slug);
  if (!path) return { notFound: true };
  return { props: { path } };
};
