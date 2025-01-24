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
];

export const secretKeys = [
  'EL_RPC_URLS_1',
  'EL_RPC_URLS_5',
  'EL_RPC_URLS_17000',
  'EL_RPC_URLS_11155111',
  'EL_RPC_URLS_10',
  'EL_RPC_URLS_11155420',
  'EL_RPC_URLS_1868',
  'EL_RPC_URLS_1946'
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

  // console.log('process.env:', process.env)
  for (const key of secretKeys) {
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
  logSecretEnvironmentVariables();
};
