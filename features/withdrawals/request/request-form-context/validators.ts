import { formatEther } from '@ethersproject/units';
import { TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import { Resolver } from 'react-hook-form';

import { TokensWithdrawable } from 'features/withdrawals/types/tokens-withdrawable';
import {
  RequestFormNetworkData,
  RequestFormInputType,
  ValidationResults,
} from '.';
import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';

import {
  ValidationError,
  handleResolverValidationError,
} from 'shared/hook-form/validation/validation-error';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { awaitWithTimeout } from 'utils/await-with-timeout';
import { validateEtherAmount } from 'shared/hook-form/validation/validate-ether-amount';
import { validateBignumberMin } from 'shared/hook-form/validation/validate-bignumber-min';
import { validateBignumberMax } from 'shared/hook-form/validation/validate-bignumber-max';

// helpers that should be shared when adding next hook-form

export type TvlErrorPayload = {
  balanceDiffSteth: BigNumber;
};
export class ValidationTvlJoke extends ValidationError {
  static type = 'validate_tvl_joke';
  payload: TvlErrorPayload;
  constructor(field: string, msg: string, payload: TvlErrorPayload) {
    super(field, msg, ValidationTvlJoke.type);
    this.payload = payload;
  }
}

export type SplitRequestErrorPayload = {
  requestCount: number;
};

export class ValidationSplitRequest extends ValidationError {
  static type = 'validation_request_split';
  payload: SplitRequestErrorPayload;
  constructor(field: string, msg: string, payload: SplitRequestErrorPayload) {
    super(field, msg, ValidationTvlJoke.type);
    this.payload = payload;
  }
}

const messageMinUnstake = (min: BigNumber, token: TokensWithdrawable) =>
  `Minimum unstake amount is ${formatEther(min)} ${getTokenDisplayName(token)}`;

const messageMaxAmount = (max: BigNumber, token: TokensWithdrawable) =>
  `${getTokenDisplayName(token)} amount must not be greater than ${formatEther(
    max,
  )}`;

// TODO!: write tests for this validation function
const validateSplitRequests = (
  field: string,
  amount: BigNumber,
  amountPerRequest: BigNumber,
  maxRequestCount: number,
): BigNumber[] => {
  const maxAmount = amountPerRequest.mul(maxRequestCount);

  const lastRequestAmountEther = amount.mod(amountPerRequest);
  const restCount = lastRequestAmountEther.gt(0) ? 1 : 0;
  const requestCount = amount.div(amountPerRequest).toNumber() + restCount;

  const isMoreThanMax = amount.gt(maxAmount);
  if (isMoreThanMax) {
    throw new ValidationError(
      field,
      `You can send a maximum of ${maxRequestCount} requests per transaction. Current requests count is ${requestCount}.`,
      'validation_request_split',
      { requestCount },
    );
  }

  const requests = Array.from<BigNumber>({ length: requestCount }).fill(
    amountPerRequest,
  );
  if (restCount) {
    requests[requestCount - 1] = lastRequestAmountEther;
  }

  return requests;
};

const tvlJokeValidate = (
  field: string,
  valueSteth: BigNumber,
  tvl: BigNumber,
  balanceSteth: BigNumber,
) => {
  const tvlDiff = valueSteth.sub(tvl);
  if (tvlDiff.gt(0))
    throw new ValidationTvlJoke(field, 'amount bigger than tvl', {
      balanceDiffSteth: valueSteth.sub(balanceSteth),
    });
};

// helper to get filter out context values
const transformContext = (
  context: RequestFormNetworkData,
  values: RequestFormInputType,
) => {
  const isSteth = values.token === TOKENS.STETH;
  return {
    isSteth,
    balance: isSteth ? context.balanceSteth : context.balanceWSteth,
    minAmountPerRequest: isSteth
      ? context.minUnstakeSteth
      : context.minUnstakeWSteth,
    maxAmountPerRequest: isSteth
      ? context.maxAmountPerRequestSteth
      : context.maxAmountPerRequestWSteth,
    maxRequestCount: context.maxRequestCount,
    stethTotalSupply: context.stethTotalSupply,
  };
};

// Validation pipeline resolver
// receives values from form and context with helper data
// returns values or errors
export const RequestFormValidationResolver: Resolver<
  RequestFormInputType,
  Promise<RequestFormNetworkData>
> = async (values, contextPromise) => {
  const { amount, mode, token } = values;
  const validationResults: ValidationResults = {
    requests: null,
  };
  let setResults;
  try {
    // this check does not require context and can be placed first
    // also limits context missing edge cases on page start
    validateEtherAmount('amount', amount, token);

    // wait for context promise with timeout and extract relevant data
    // validation function only waits limited time for data and fails validation otherwise
    // most of the time data will already be available
    invariant(contextPromise, 'must have context promise');
    const context = await awaitWithTimeout(
      contextPromise,
      VALIDATION_CONTEXT_TIMEOUT,
    );
    setResults = context.setIntermediateValidationResults;
    const {
      isSteth,
      balance,
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
      stethTotalSupply,
    } = transformContext(context, values);

    invariant(balance, 'balance must be presented');
    invariant(stethTotalSupply, 'stethTotalSupply must be presented');
    invariant(minAmountPerRequest, 'minAmountPerRequest must be presented');
    invariant(maxAmountPerRequest, 'maxAmountPerRequest must be presented');

    if (isSteth) {
      tvlJokeValidate('amount', amount, stethTotalSupply, balance);
    }

    // early validation exit for dex option
    if (mode === 'dex') {
      return { values, errors: {} };
    }

    const requests = validateSplitRequests(
      'amount',
      amount,
      maxAmountPerRequest,
      maxRequestCount,
    );
    validationResults.requests = requests;

    validateBignumberMin(
      'amount',
      amount,
      minAmountPerRequest,
      messageMinUnstake(minAmountPerRequest, token),
    );

    validateBignumberMax(
      'amount',
      amount,
      balance,
      messageMaxAmount(balance, token),
    );

    return {
      values: { ...values, requests },
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(
      error,
      'WithdrawalRequestForm',
      'amount',
    );
  } finally {
    // no matter validation result save results for the UI to show
    setResults?.(validationResults);
  }
};
