import { BigNumber } from 'ethers';

export const convertToBigNumber = (value: bigint | BigNumber): BigNumber => {
  if (typeof value === 'bigint') {
    return BigNumber.from(value.toString());
  }
  return value;
};
