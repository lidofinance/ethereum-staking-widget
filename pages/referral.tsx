import { FC } from 'react';
import { GetServerSideProps } from 'next';
import Metrics from 'utilsApi/metrics';
import { PAGES } from 'config';
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

export const getServerSideProps: GetServerSideProps = async () => {
  Metrics.request.requestCounter.inc({ route: PAGES.REFERRAL });

  return { props: {} };
};
