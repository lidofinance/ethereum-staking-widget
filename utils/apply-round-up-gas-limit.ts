import { BigNumber } from 'ethers';

const bn1000 = BigNumber.from(1000);
const bn999 = BigNumber.from(999);

// 94567 -> 94 -> 94000 -> 94999
export const applyRoundUpGasLimit = (number: BigNumber): BigNumber =>
  number.div(bn1000).mul(bn1000).add(bn999);
