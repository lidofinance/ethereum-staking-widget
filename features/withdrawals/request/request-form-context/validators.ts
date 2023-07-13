import { Zero } from '@ethersproject/constants';
import { formatEther } from '@ethersproject/units';
import { TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';
import { Resolver } from 'react-hook-form';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { RequestFormValidationContextType } from '.';
import { RequestFormInputType, ValidationResults } from '.';

export class ValidationError extends Error {
  field: string;
  type: string;
  data: Record<string, unknown>;
  constructor(
    field: string,
    msg: string,
    type?: string,
    data?: Record<string, unknown>,
  ) {
    super(msg);
    this.field = field;
    this.type = type ?? 'validate';
    this.data = data ?? {};
  }
}

type WITHDRAWAL_TOKENS = TOKENS.STETH | TOKENS.WSTETH;

// asserts only work with function declaration
// eslint-disable-next-line func-style
function validateEtherAmount(
  field: string,
  amount: BigNumber | null,
  token: WITHDRAWAL_TOKENS,
): asserts amount is BigNumber {
  if (!amount)
    throw new ValidationError(
      field,
      `${getTokenDisplayName(token)} ${field} is required`,
    );

  if (amount.lte(Zero))
    throw new ValidationError(field, `${field}  must be greater than 0`);
}

const validateMinUnstake = (
  field: string,
  value: BigNumber,
  min: BigNumber,
  token: WITHDRAWAL_TOKENS,
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

const validateMaxAmount = (field: string, value: BigNumber, max: BigNumber) => {
  if (value.gt(max))
    throw new ValidationError(
      field,
      `${field} must not be greater than ${formatEther(max)}`,
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
    throw new ValidationError(
      field,
      'amount bigger than tvl',
      'validate_tvl_joke',
      { tvlDiff, balanceDiffSteth: balanceSteth },
    );
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
  RequestFormValidationContextType
> = async (values, context) => {
  const validationResults: ValidationResults = {
    requests: null,
  };
  try {
    const { amount, mode, token } = values;
    if (!context) throw new ValidationError('root', 'empty context');
    const {
      isSteth,
      balance,
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
      stethTotalSupply,
    } = transformContext(context, values);

    validateEtherAmount('amount', amount, token);

    if (isSteth) tvlJokeValidate('amount', amount, stethTotalSupply, balance);

    // early validation exit for dex option
    if (mode === 'dex') {
      return { values: { ...values }, errors: {} };
    }

    const requests = validateSplitRequests(
      'amount',
      amount,
      maxAmountPerRequest,
      maxRequestCount,
    );
    validationResults.requests = requests;

    validateMinUnstake('amount', amount, minAmountPerRequest, token);

    validateMaxAmount('amount', amount, balance);

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
            ...error.data,
          },
        },
      };
    }
    console.warn('[RequestForm] Unhandled validation error in resolver', error);
    return {
      values: {},
      errors: {
        root: { value: { type: 'root', message: 'unknown validation error' } },
      },
    };
  } finally {
    // no matter validation result save results for the UI to show
    context?.setIntermediateValidationResults(validationResults);
  }
};
