export interface StandConfig {
  chainId: number;
}

const STAND_CONFIGS = new Map<string, StandConfig>([
  [
    'testnet',
    {
      chainId: 17000, // TODO: replace?
    },
  ],
  [
    'staging-critical',
    {
      chainId: 1,
    },
  ],
]);

export interface Config {
  STAND_URL?: string;
  STAND_CONFIG: StandConfig;
  STAND_USER?: string;
  STAND_PASSWORD?: string;
  STAND_TYPE?: string;
}

const getConfig = (): Config => {
  const standType = process.env.STAND_TYPE || 'testnet';
  const standConfig = STAND_CONFIGS.get(standType);
  if (!standConfig) {
    throw `No config available for '${standType}' stand type!`;
  }
  const config: Config = {
    STAND_URL: process.env.STAND_URL || 'http://localhost:3000',
    STAND_CONFIG: standConfig,
    STAND_USER: process.env.STAND_USER,
    STAND_PASSWORD: process.env.STAND_PASSWORD,
    STAND_TYPE: standType,
  };
  return config;
};

export const CONFIG = getConfig();
