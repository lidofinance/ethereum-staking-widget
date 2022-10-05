import { FC } from 'react';
import { Banner } from 'features/referral';
import { Layout } from 'shared/components';

const Referral: FC = () => {
  return (
    <Layout title="Referral">
      <Banner />
    </Layout>
  );
};

export default Referral;
