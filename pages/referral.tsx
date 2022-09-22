import { FC } from 'react';
import { Banner } from 'features/referral';
import { Layout } from 'shared/components';

const Referral: FC = () => {
  return (
    <Layout
      title="Referral"
      subtitle="Earn rewards by spreading the benefits of staking with Lido."
    >
      <Banner />
    </Layout>
  );
};

export default Referral;
