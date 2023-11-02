import { FC } from 'react';
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
