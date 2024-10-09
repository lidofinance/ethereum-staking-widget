import { config } from 'config';
import type { BigNumber } from 'ethers';

export const applyGasLimitRatio = (gasLimit: BigNumber): BigNumber =>
  gasLimit
    .mul(config.SUBMIT_EXTRA_GAS_TRANSACTION_RATIO * config.PRECISION)
    .div(config.PRECISION);

export const applyGasLimitRatioBigInt = (gasLimit: bigint): bigint =>
  (gasLimit *
    BigInt(config.SUBMIT_EXTRA_GAS_TRANSACTION_RATIO * config.PRECISION)) /
  BigInt(config.PRECISION);
