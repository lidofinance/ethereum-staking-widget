import { BigNumber } from 'ethers';
import { LIMIT_LEVEL } from './types';

// almost reached whenever current limit is ≤25% of max limit, i.e. 4 times lower
const WARN_THRESHOLD_RATIO = BigNumber.from(4);

export const getLimitLevel = (maxLimit: BigNumber, currentLimit: BigNumber) => {
  if (currentLimit.eq(0)) return LIMIT_LEVEL.REACHED;

  if (maxLimit.div(currentLimit).gte(WARN_THRESHOLD_RATIO))
    return LIMIT_LEVEL.WARN;

  return LIMIT_LEVEL.SAFE;
};
