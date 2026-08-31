import { TestEnvBanner as LidoTestEnvBanner } from '@lidofinance/lido-app-ui';
import { overrideWithQAMockBoolean } from 'utils/qa';
import { config } from 'config';
import { QA_KEYS } from 'consts/qa-keys';

const showTestEnvBanner = overrideWithQAMockBoolean(
  // isProd comes from the window-env data element, which is atomic with
  // the HTML response — the stale-cached-env failure mode this check once
  // defended against no longer exists.
  !config.isProd,
  QA_KEYS.testEnvBanner,
);

export const TestEnvBanner = () => {
  if (!showTestEnvBanner) return null;
  return <LidoTestEnvBanner />;
};
