import { FC } from 'react';
import { GetStaticProps } from 'next';

import { config } from 'config';
import { Layout } from 'shared/components';
import { SettingsForm } from 'features/settings/settings-form';

const Settings: FC = () => {
  return (
    <Layout title="Settings">
      <SettingsForm />
    </Layout>
  );
};

export default Settings;

export const getStaticProps: GetStaticProps = async () => {
  if (!config.ipfsMode) return { notFound: true };

  return { props: {} };
};
