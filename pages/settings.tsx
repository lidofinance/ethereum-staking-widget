import { FC } from 'react';
import { GetStaticProps } from 'next';

import { getConfig } from 'config';
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
  const { ipfsMode } = getConfig();
  if (!ipfsMode) return { notFound: true };

  return { props: {} };
};
