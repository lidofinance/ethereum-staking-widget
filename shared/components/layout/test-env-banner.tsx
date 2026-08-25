import { TestEnvBanner as LidoTestEnvBanner } from '@lidofinance/lido-app-ui';
import { overrideWithQAMockBoolean } from 'utils/qa';
import { config } from 'config';
import NoSsrWrapper from '../no-ssr-wrapper';

const showTestEnvBanner = overrideWithQAMockBoolean(
  !config.isProd,
  'mock-qa-helpers-show-test-env-banner',
);

export const TestEnvBanner = () => {
  if (!showTestEnvBanner) return null;
  return (
    <NoSsrWrapper>{showTestEnvBanner && <LidoTestEnvBanner />}</NoSsrWrapper>
  );
};
