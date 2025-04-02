import { FC } from 'react';

import { config } from 'config';
import { Layout } from 'shared/components';
import { SettingsForm } from 'features/settings/settings-form';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

// just for testing

const Settings: FC = () => {
  return (
    <Layout title="Settings">
      <SettingsForm />
    </Layout>
  );
};

export const getStaticProps = getDefaultStaticProps('/settings', async () => {
  if (!config.ipfsMode) return { notFound: true };

  return { props: {} };
});

export default Settings;
