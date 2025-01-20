import { FC } from 'react';

import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { Banner } from 'features/referral';
import { Layout } from 'shared/components';

const Referral: FC = () => {
  return (
    <Layout title="Referral">
      <Banner />
    </Layout>
  );
};
export const getStaticProps = getDefaultStaticProps('/referral');

export default Referral;
