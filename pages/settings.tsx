import { FC } from 'react';
import { GetStaticProps } from 'next';

import { Layout } from 'shared/components';
import { SettingsForm } from 'features/settings/settings-form';
import { getOneConfig } from 'providers/one-config';

const Settings: FC = () => {
  return (
    <Layout title="Settings">
      <SettingsForm />
    </Layout>
  );
};

export default Settings;

export const getStaticProps: GetStaticProps = async () => {
  const { ipfsMode } = getOneConfig();
  if (!ipfsMode) return { notFound: true };

  return { props: {} };
};
