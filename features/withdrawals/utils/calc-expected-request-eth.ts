import { calcShareRate, e27 } from './calc-share-rate';
import { RequestStatus } from '../types/request-status';

export const calcExpectedRequestEth = (
  requestStatus: RequestStatus,
  currentShareRate: bigint,
) => {
  const requestShareRate = calcShareRate(
    requestStatus.amountOfStETH,
    requestStatus.amountOfShares,
  );
  if (currentShareRate >= requestShareRate) {
    return requestStatus.amountOfStETH;
  } else {
    const expectedETH =
      (requestStatus.amountOfShares * currentShareRate) / e27(1);
    return expectedETH;
  }
};
