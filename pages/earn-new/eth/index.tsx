import type { FC } from 'react';
import Head from 'next/head';

import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { NewEarnVaultPage } from 'features/new-earn';

const PAGE_TITLE = 'Lido Earn ETH';

// TODO: move to [vault] folder
const EarnNewEth: FC = () => {
  return (
    <Layout containerSize="full">
      <Head>
        <title>{`${PAGE_TITLE} | Lido`}</title>
        <meta
          name="description"
          content="Lido Earn ETH vault utilizes tried and tested strategies with premier DeFi protocols."
        />
      </Head>
      <NewEarnVaultPage vault="eth" />
    </Layout>
  );
};

// TODO: will fix when will move to [vault] folder
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const getStaticProps = getDefaultStaticProps('/earn-new/eth');

export default EarnNewEth;
