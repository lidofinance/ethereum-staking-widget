import { FC } from 'react';
import { GetStaticProps } from 'next';
import { Block, Checkbox } from '@lidofinance/lido-ui';

import { config } from 'config';
import {
  useFeatureFlag,
  RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED,
} from 'config/feature-flags';
import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

const FeatureFlags: FC = () => {
  const { rpcSettingsPageOnInfraIsEnabled, setFeatureFlag } = useFeatureFlag(
    RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED,
  );

  return (
    <Layout title="Feature Flags">
      <NoSSRWrapper>
        <br />
        <Block>
          <Checkbox
            checked={rpcSettingsPageOnInfraIsEnabled}
            onChange={() =>
              setFeatureFlag(
                RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED,
                !rpcSettingsPageOnInfraIsEnabled,
              )
            }
            label="RPC settings page on infra"
          />
        </Block>
      </NoSSRWrapper>
    </Layout>
  );
};

export default FeatureFlags;

export const getStaticProps: GetStaticProps = async () => {
  if (!config.featureFlagsPageIsEnabled) return { notFound: true };

  return { props: {} };
};
