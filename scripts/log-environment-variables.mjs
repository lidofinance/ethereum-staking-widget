export const openKeys = [
  'SELF_ORIGIN',
  'ROOT_ORIGIN',
  'DOCS_ORIGIN',
  'HELP_ORIGIN',
  'RESEARCH_ORIGIN',
  'BLOG_ORIGIN',

  'SUPPORTED_CHAINS',
  'DEFAULT_CHAIN',

  'CSP_TRUSTED_HOSTS',
  'CSP_REPORT_ONLY',
  'CSP_REPORT_URI',

  'ENABLE_QA_HELPERS',

  'REWARDS_BACKEND',

  'RATE_LIMIT',
  'RATE_LIMIT_TIME_FRAME',

  'ETH_API_BASE_PATH',
  'WQ_API_BASE_PATH',
  'MATOMO_URL',
  'WALLETCONNECT_PROJECT_ID',
  'REWARDS_BACKEND_BASE_PATH',
  'VALIDATION_FILE_PATH',
];

export const secretKeys = [
  'EL_RPC_URLS_1',
  'EL_RPC_URLS_5',
  'EL_RPC_URLS_10',
  'EL_RPC_URLS_130',
  'EL_RPC_URLS_1301',
  'EL_RPC_URLS_1868',
  'EL_RPC_URLS_1946',
  'EL_RPC_URLS_17000',
  'EL_RPC_URLS_560048',
  'EL_RPC_URLS_11155111',
  'EL_RPC_URLS_11155420',
];

export const logOpenEnvironmentVariables = () => {
  console.log('---------------------------------------------');
  console.log('Log environment variables (without secrets):');
  console.log('---------------------------------------------');

  for (const key of openKeys) {
    if (!process.env.hasOwnProperty(key)) {
      console.error(`${key} - ERROR (not exist in process.env)`);
      continue;
    }

    console.info(`${key} = ${process.env[key]}`);
  }

  console.log('---------------------------------------------');
  console.log('');
};

export const logSecretEnvironmentVariables = () => {
  console.log('---------------------------------------------');
  console.log('Log secret environment variables:');
  console.log('---------------------------------------------');

  if (!process.env['SUPPORTED_CHAINS']) {
    console.warn('SUPPORTED_CHAINS is not defined in process.env!');
    console.warn('Skip the logSecretEnvironmentVariables check!');
    return;
  }

  const supportedChains = process.env['SUPPORTED_CHAINS']
    .split(',')
    .map((s) => s.trim());

  for (const key of secretKeys) {
    if (key.startsWith('EL_RPC_URLS_')) {
      const chainId = key.replace('EL_RPC_URLS_', '');
      if (!supportedChains.includes(chainId)) {
        console.info(
          `Secret ${key} - skipped (${chainId} isn't in the SUPPORTED_CHAINS)!`,
        );
        // Skip check if chainId isn't in the SUPPORTED_CHAINS
        continue;
      }
    }

    if (!process.env.hasOwnProperty(key)) {
      console.error(`Secret ${key} - ERROR (not exist in process.env)`);
      continue;
    }

    if (process.env[key].length > 0) {
      console.info(`Secret ${key} - OK (exist and not empty)`);
    } else {
      console.warn(`Secret ${key} - WARN (exist but empty)`);
    }
  }

  console.log('---------------------------------------------');
};

export const logEnvironmentVariables = () => {
  logOpenEnvironmentVariables();

  if (process.env.RUN_SECRET_ENV_LOGGING === 'true') {
    logSecretEnvironmentVariables();
  }
};
