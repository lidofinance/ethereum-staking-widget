import { TestEnvBanner as LidoTestEnvBanner } from '@lidofinance/lido-app-ui';
import { overrideWithQAMockBoolean } from 'utils/qa';
import { config } from 'config';
import { QA_KEYS } from 'consts/qa-keys';

const showTestEnvBanner = overrideWithQAMockBoolean(
  // prevents showing the banner if envs are stale and missing isProd
  config.isProd === false,
  QA_KEYS.testEnvBanner,
);

export const TestEnvBanner = () => {
  if (!showTestEnvBanner) return null;
  return <LidoTestEnvBanner />;
};
