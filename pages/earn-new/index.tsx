import type { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { Link } from '@lidofinance/lido-ui';

import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { NewEarnList } from 'features/new-earn';

const PAGE_TITLE = 'Earn';

const HowItWorksLink = styled(Link)`
  display: inline;
  white-space: nowrap;
`;

const PAGE_DESCRIPTION = (
  <>
    Automate your earnings with vaults designed for sustainable on-chain yield.
    <span> </span>
    <HowItWorksLink
      href="#"
      onClick={(event) => {
        event.preventDefault();
        // TODO: wire to "How it works?" page
      }}
    >
      How it works?
    </HowItWorksLink>
  </>
);

const EarnNew: FC = () => {
  return (
    <Layout title={PAGE_TITLE} subtitle={PAGE_DESCRIPTION}>
      <Head>
        <title>{`${PAGE_TITLE} | Lido`}</title>
        <meta
          name="description"
          content="Automate your earnings with vaults designed for sustainable on-chain yield."
        />
      </Head>
      <NewEarnList />
    </Layout>
  );
};

export const getStaticProps = getDefaultStaticProps('/earn-new');

export default EarnNew;
