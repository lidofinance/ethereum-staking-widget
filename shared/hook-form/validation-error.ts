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

export const handleResolverValidationError = (
  error: unknown,
  formName: string,
  fallbackErrorField: string,
) => {
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
  return {
    values: {},
    errors: {
      // for general errors we use 'requests' field
      // cause non-fields get ignored and form is still considerate valid
      [fallbackErrorField]: {
        type: 'validate',
        message: 'unknown validation error',
      },
    },
  };
};
