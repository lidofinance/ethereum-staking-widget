import { BigNumber } from 'ethers';

export const applyRoundUpGasLimit = (number: BigNumber): BigNumber => {
  const bn1000 = BigNumber.from(1000);

  // 94567 -> 94 -> 94000 -> 94999
  return number.div(bn1000).mul(bn1000).add(BigNumber.from(999));
};
