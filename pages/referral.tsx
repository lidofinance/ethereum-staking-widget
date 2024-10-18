import { FC } from 'react';

import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { Banner } from 'features/referral';
import { Layout } from 'shared/components';
import { SupportOnlyL1Chains } from 'modules/web3';

const Referral: FC = () => {
  return (
    <SupportOnlyL1Chains>
      <Layout title="Referral">
        <Banner />
      </Layout>
    </SupportOnlyL1Chains>
  );
};
export const getStaticProps = getDefaultStaticProps();

export default Referral;
