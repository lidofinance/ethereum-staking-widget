import { MaxUint256, Zero } from '@ethersproject/constants';
import { formatEther } from '@ethersproject/units';
import { TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import { Resolver } from 'react-hook-form';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { TokensWithdrawable } from 'features/withdrawals/types/tokens-withdrawable';
import {
  RequestFormValidationContextType,
  RequestFormInputType,
  ValidationResults,
} from '.';

// helpers that should be shared when adding next hook-form

export const withTimeout = <T>(toWait: Promise<T>, timeout: number) =>
  Promise.race([
    toWait,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('promise timeout')), timeout),
    ),
  ]);

export class ValidationError extends Error {
  field: string;
  type: string;
  payload: Record<string, unknown>;
  constructor(
    field: string,
    msg: string,
    type?: string,
    payload?: Record<string, unknown>,
  ) {
    super(msg);
    this.field = field;
    this.type = type ?? 'validate';
    this.payload = payload ?? {};
  }
}

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

// asserts only work with function declaration
// eslint-disable-next-line func-style
function validateEtherAmount(
  field: string,
  amount: BigNumber | null,
  token: TokensWithdrawable,
): asserts amount is BigNumber {
  if (!amount)
    throw new ValidationError(
      field,
      `${getTokenDisplayName(token)} ${field} is required`,
    );

  if (amount.lte(Zero))
    throw new ValidationError(
      field,
      `${getTokenDisplayName(token)} ${field} must be greater than 0`,
    );

  if (amount.gt(MaxUint256))
    throw new ValidationError(
      field,
      `${getTokenDisplayName(token)} ${field} is not valid`,
    );
}

const validateMinUnstake = (
  field: string,
  value: BigNumber,
  min: BigNumber,
  token: TokensWithdrawable,
) => {
  if (value.lt(min))
    throw new ValidationError(
      field,
      `Minimum unstake amount is ${formatEther(min)} ${getTokenDisplayName(
        token,
      )}`,
    );
  return value;
};

const validateMaxAmount = (
  field: string,
  value: BigNumber,
  max: BigNumber,
  token: TokensWithdrawable,
) => {
  if (value.gt(max))
    throw new ValidationError(
      field,
      `${getTokenDisplayName(
        token,
      )} ${field} must not be greater than ${formatEther(max)}`,
    );
};

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

  const requests = Array(requestCount).fill(amountPerRequest);
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
  context: RequestFormValidationContextType,
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
  Promise<RequestFormValidationContextType>
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
    invariant(contextPromise, 'must have context promise');
    const context = await withTimeout(contextPromise, 4000);
    setResults = context.setIntermediateValidationResults;
    const {
      isSteth,
      balance,
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
      stethTotalSupply,
    } = transformContext(context, values);

    if (isSteth) tvlJokeValidate('amount', amount, stethTotalSupply, balance);

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

    validateMinUnstake('amount', amount, minAmountPerRequest, token);

    validateMaxAmount('amount', amount, balance, token);

    return {
      values: { ...values, requests },
      errors: {},
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        values: {},
        errors: {
          [error.field]: {
            message: error.message,
            type: error.type,
            payload: error.payload,
          },
        },
      };
    }
    console.warn('[RequestForm] Unhandled validation error in resolver', error);
    return {
      values: {},
      errors: {
        // for general errors we use 'requests' field
        // cause non-fields get ignored and form is still considerate valid
        requests: {
          type: 'validate',
          message: 'unknown validation error',
        },
      },
    };
  } finally {
    // no matter validation result save results for the UI to show
    setResults?.(validationResults);
  }
};
