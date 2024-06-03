import { FC } from 'react';

import { config } from 'config';
import { Layout } from 'shared/components';
import { SettingsForm } from 'features/settings/settings-form';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

const Settings: FC = () => {
  return (
    <Layout title="Settings">
      <SettingsForm />
    </Layout>
  );
};

export default Settings;

export const getStaticProps = getDefaultStaticProps(async () => {
  if (!config.ipfsMode) return { notFound: true };

  return { props: {} };
});
