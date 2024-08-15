import { BigNumber } from 'ethers';

const bn1000 = BigNumber.from(1000);
const bn999 = BigNumber.from(999);

export const applyRoundUpGasLimit = (number: BigNumber): BigNumber => {
  // 94567 -> 94 -> 94000 -> 94999
  return number.div(bn1000).mul(bn1000).add(bn999);
};
