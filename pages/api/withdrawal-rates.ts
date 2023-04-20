import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { API_ROUTES } from 'config';
import {
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

import { BigNumber } from 'ethers';
import { ParamError } from 'utilsApi/apiHelpers';
import { getWithdrawalRates } from 'utilsApi/getWithdrawalRates';

const MAX_UINT265 = BigNumber.from(2).pow(BigNumber.from(265)).sub(-1);
const MAX_STRING_LENGTH = MAX_UINT265.toString().length;

// Gets rates for Steth/Eth for dex driven withdrawal
// Returns {name:string,rate:number}[]
const withdrawalRates: API = async (req, res) => {
  // METHOD BOUNDARY
  if (req.method !== 'GET') {
    res.status(405);
    return;
  }

  // PARAMS BOUNDARY
  let amount = BigNumber.from(1);
  try {
    const string_amount = req.query.amount;
    if (
      typeof string_amount !== 'string' ||
      string_amount.length > MAX_STRING_LENGTH
    )
      throw new ParamError({ amount: 'invalid' });
    amount = BigNumber.from(string_amount);
    if (amount.isZero() || amount.isNegative())
      throw new ParamError({ amount: 'cannot be zero or less' });
  } catch (e) {
    res.status(422);
    if (e instanceof ParamError) {
      res.json(e.params);
    }
    return;
  }

  const result = await getWithdrawalRates({
    amount,
  }).catch(() => {
    throw new Error('Failed to get withdrawal rates');
  });
  res.status(200).json(result);
};

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.WITHDRAWAL_RATES),
  ...errorAndCacheDefaultWrappers,
])(withdrawalRates);
