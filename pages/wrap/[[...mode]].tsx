import { FC } from 'react';
import { GetStaticPaths } from 'next';
import Head from 'next/head';

import { WrapUnwrapTabs } from 'features/wsteth/wrap-unwrap-tabs';
import { Layout } from 'shared/components';
import { SupportL2Chains } from 'modules/web3';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { LegalDisclaimer } from 'shared/components/legal-disclaimer';
import { DisclaimerSection } from 'shared/components/disclaimer-section';

const WrapPage: FC<WrapModePageProps> = ({ mode }) => {
  return (
    <SupportL2Chains>
      <Layout
        title="Wrap & Unwrap"
        subtitle="Stable-balance stETH wrapper for DeFi"
      >
        <Head>
          <title>Wrap | Lido</title>
        </Head>
        <WrapUnwrapTabs mode={mode} />
        <DisclaimerSection>
          <LegalDisclaimer />
        </DisclaimerSection>
      </Layout>
    </SupportL2Chains>
  );
};

export default WrapPage;

type WrapModePageProps = {
  mode: 'wrap' | 'unwrap';
};

type WrapModePageParams = {
  mode: ['unwrap'] | undefined;
};

export const getStaticPaths: GetStaticPaths<WrapModePageParams> = async () => {
  return {
    paths: [{ params: { mode: undefined } }, { params: { mode: ['unwrap'] } }],
    fallback: false, // return 404 on non match
  };
};

// we need [[...]] pattern for / and /unwrap
export const getStaticProps = getDefaultStaticProps<
  WrapModePageProps,
  WrapModePageParams
>('/wrap', async ({ params }) => {
  const mode = params?.mode;
  if (!mode) return { props: { mode: 'wrap' } };
  if (mode[0] === 'unwrap') return { props: { mode: 'unwrap' } };

  return { notFound: true };
});
