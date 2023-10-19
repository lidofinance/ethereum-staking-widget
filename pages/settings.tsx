import { FC } from 'react';
import { Layout } from 'shared/components';
import {
  SettingsForm,
  SettingsFormWrap,
} from 'features/settings/settings-form';

const Referral: FC = () => {
  return (
    <Layout title="Settings">
      <SettingsFormWrap>
        <SettingsForm />
      </SettingsFormWrap>
    </Layout>
  );
};

export default Referral;