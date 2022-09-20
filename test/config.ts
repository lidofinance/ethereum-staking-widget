import axios from 'axios';

export interface StandConfig {
  chainId: number;
}

const STAND_CONFIGS = new Map<string, StandConfig>([
  [
    'testnet',
    {
      chainId: 5,
    },
  ],
  [
    'staging',
    {
      chainId: 1,
    },
  ],
]);

export interface Config {
  STAND_URL: string | undefined;
  STAND_CONFIG: StandConfig;
  STAND_USER: string | undefined;
  STAND_PASSWORD: string | undefined;
}

const getConfig = (): Config => {
  const standType = process.env.STAND_TYPE || 'testnet';
  const standConfig = STAND_CONFIGS.get(standType);
  if (!standConfig) {
    throw `No config available for '${standType}' stand type!`;
  }
  const config: Config = {
    STAND_URL: process.env.STAND_URL,
    STAND_CONFIG: standConfig,
    STAND_USER: process.env.STAND_USER,
    STAND_PASSWORD: process.env.STAND_PASSWORD,
  };
  if (!config.STAND_URL) {
    throw 'ENV STAND_URL is required!';
  }
  return config;
};

export const CONFIG = getConfig();

const auth =
  CONFIG.STAND_USER && CONFIG.STAND_PASSWORD
    ? Buffer.from(
        `${CONFIG.STAND_USER}:${CONFIG.STAND_PASSWORD}`,
        'utf8',
      ).toString('base64')
    : undefined;

axios.defaults.baseURL = CONFIG.STAND_URL;
axios.defaults.validateStatus = () => true;
if (auth) {
  axios.defaults.headers.common['Authorization'] = `Basic ${auth}`;
}
