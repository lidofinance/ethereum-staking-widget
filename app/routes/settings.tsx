import { config } from 'config';
import {
  RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED,
  useFeatureFlag,
} from 'config/feature-flags';
import { Layout } from 'shared/components';
import { SettingsForm } from 'features/settings/settings-form';

import NotFoundPage from './not-found';

/**
 * `/settings` — IPFS build only. The Next.js variant returned `notFound`
 * from `getStaticProps` unless `config.ipfsMode`; here the non-IPFS build
 * renders the 404 page. On infra builds the page can be enabled with the
 * `rpcSettingsPageOnInfraIsEnabled` feature flag (QA debug drawer).
 */
export default function SettingsPage() {
  const { rpcSettingsPageOnInfraIsEnabled } = useFeatureFlag(
    RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED,
  );

  if (!config.ipfsMode && !rpcSettingsPageOnInfraIsEnabled)
    return <NotFoundPage />;

  return (
    <Layout title="Settings">
      <SettingsForm />
    </Layout>
  );
}
