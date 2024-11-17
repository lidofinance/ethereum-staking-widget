import { config } from 'config';

export const applyGasLimitRatio = (gasLimit: bigint): bigint =>
  (gasLimit *
    BigInt(config.SUBMIT_EXTRA_GAS_TRANSACTION_RATIO * config.PRECISION)) /
  BigInt(config.PRECISION);
