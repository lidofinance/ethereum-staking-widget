import { TestEnvBanner as LidoTestEnvBanner } from '@lidofinance/lido-app-ui';
import { overrideWithQAMockBoolean } from 'utils/qa';
import { config } from 'config';
import { QA_KEYS } from 'consts/qa-keys';

const showTestEnvBanner = overrideWithQAMockBoolean(
  !config.isProd,
  QA_KEYS.testEnvBanner,
);

export const TestEnvBanner = () => {
  if (!showTestEnvBanner) return null;
  return <LidoTestEnvBanner />;
};
