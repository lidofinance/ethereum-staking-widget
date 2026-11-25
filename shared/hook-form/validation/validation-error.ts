import { ToastError } from '@lidofinance/lido-ui';
import type { FieldError } from 'react-hook-form';

export enum DefaultValidationErrorTypes {
  VALIDATE = 'VALIDATE',
  UNHANDLED = 'UNHANDLED',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
}

// shape of a failed resolver result: hook-form requires empty `values`
// whenever `errors` is not empty
export type ResolverErrorResult = {
  values: Record<string, never>;
  errors: Record<string, FieldError & { payload?: Record<string, unknown> }>;
};

// Blocks submit (non-empty errors) but is deliberately neither VALIDATE nor
// UNHANDLED and has no message, so submit buttons and inputs do not react to
// it (same observable behavior as the previous bare-string error)
export const walletNotConnectedResult = (
  field: string,
): ResolverErrorResult => ({
  values: {},
  errors: {
    [field]: { type: DefaultValidationErrorTypes.WALLET_NOT_CONNECTED },
  },
});

export const isValidationErrorTypeValidate = (type?: string) =>
  type === DefaultValidationErrorTypes.VALIDATE;

export const isValidationErrorTypeUnhandled = (type?: string) =>
  type === DefaultValidationErrorTypes.UNHANDLED;

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
    this.type = type ?? DefaultValidationErrorTypes.VALIDATE;
    this.payload = payload ?? {};
  }
}

export const handleResolverValidationError = (
  error: unknown,
  formName: string,
  fallbackErrorField: string,
): ResolverErrorResult => {
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
  console.warn(`[${formName}] Unhandled validation error in resolver`, error);

  ToastError('Unknown validation error. Please try again later.', {
    toastId: 'VALIDATION_ERROR',
    hideProgressBar: true,
    closeOnClick: true,
    position: 'bottom-left',
  });

  return {
    values: {},
    errors: {
      // for general errors we use 'requests' field
      // cause non-fields get ignored and form is still considerate valid
      [fallbackErrorField]: {
        type: DefaultValidationErrorTypes.UNHANDLED,
        message: 'unknown validation error',
      },
    },
  };
};
