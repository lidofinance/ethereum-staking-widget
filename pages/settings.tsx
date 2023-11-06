import { FC } from 'react';
import { GetStaticProps } from 'next';

import { dynamics } from 'config';
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
  if (!dynamics.ipfsMode) return { notFound: true };

  return { props: {} };
};
