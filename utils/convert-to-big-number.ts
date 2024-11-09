import { BigNumber } from 'ethers';

// DEPRECATED
// TODO: NEW SDK (remove)
export const convertToBigNumber = (value: bigint | BigNumber): BigNumber => {
  if (typeof value === 'bigint') {
    return BigNumber.from(value.toString());
  }
  return value;
};
