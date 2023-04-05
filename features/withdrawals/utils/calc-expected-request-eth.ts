import { BigNumber } from 'ethers';
import { calcShareRate, e27 } from './calc-share-rate';
import { RequestStatus } from '../types/request-status';

export const calcExpectedRequestEth = (
  requestStatus: RequestStatus,
  currentShareRate: BigNumber,
) => {
  const requestShareRate = calcShareRate(
    requestStatus.amountOfStETH,
    requestStatus.amountOfShares,
  );
  if (currentShareRate.gte(requestShareRate)) {
    return requestStatus.amountOfStETH;
  } else {
    const expectedETH = requestStatus.amountOfShares
      .mul(currentShareRate)
      .div(e27(1));
    return expectedETH;
  }
};
