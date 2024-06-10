import { FC } from 'react';
import { GetStaticProps } from 'next';
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

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 60,
  };
};
