import type { FC } from 'react';
import Head from 'next/head';

import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { NewEarnVaultPage } from 'features/new-earn';

const PAGE_TITLE = 'Lido Earn USD';

// TODO: move to [vault] folder
const EarnNewUsd: FC = () => {
  return (
    <Layout containerSize="full">
      <Head>
        <title>{`${PAGE_TITLE} | Lido`}</title>
        <meta
          name="description"
          content="Lido Earn USD vault is curated for USD-denominated assets with an optimal risk-reward profile."
        />
      </Head>
      <NewEarnVaultPage vault="usd" />
    </Layout>
  );
};

// TODO: will fix when will move to [vault] folder
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const getStaticProps = getDefaultStaticProps('/earn-new/usd');

export default EarnNewUsd;
