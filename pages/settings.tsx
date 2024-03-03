import { FC } from 'react';
// import { GetStaticProps } from 'next';

// import { config } from 'config';
import {
  RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED,
  useFeatureFlag,
} from 'config/feature-flags';
import { Layout } from 'shared/components';
import { SettingsForm } from 'features/settings/settings-form';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

const Settings: FC = () => {
  const { rpcSettingsPageOnInfraIsEnabled } = useFeatureFlag(
    RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED,
  );

  return (
    <Layout title="Settings">
      <NoSSRWrapper>
        {rpcSettingsPageOnInfraIsEnabled && <SettingsForm />}
        {!rpcSettingsPageOnInfraIsEnabled && <>Settings Not Available!</>}
      </NoSSRWrapper>
    </Layout>
  );
};

export default Settings;

// export const getStaticProps: GetStaticProps = async () => {
//   if (!config.ipfsMode) return { notFound: true };
//
//   return { props: {} };
// };
