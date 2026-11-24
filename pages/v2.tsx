import Head from 'next/head';
import { FC } from 'react';

import { Layout } from 'shared/components';

import { V2 } from 'features/v2';

const V2Page: FC = () => {
  return (
    <Layout stylesV2 containerSize="content">
      <Head>
        <title>V2 | Lido</title>
      </Head>
      <V2 />
    </Layout>
  );
};

export default V2Page;
