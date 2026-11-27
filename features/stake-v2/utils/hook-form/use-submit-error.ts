import {
  get,
  useFormState,
  type FieldError,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { isValidationErrorTypeValidate } from 'shared/hook-form/validation/validation-error';

/**
 * Error type for a validation that could not run: its data did not load.
 * Shown, but submit stays enabled: submitting validates, and reads, again.
 */
export const DATA_UNAVAILABLE_ERROR = 'DATA_UNAVAILABLE';

export type SubmitError = {
  /** text for the submit button; undefined keeps its own label */
  message?: string;
  /** true: submit is disabled until the values change */
  isBlocking: boolean;
};

/**
 * What the submit button should do about errors, from the first of
 * `fields` that has one: a validation error blocks submit, an
 * unavailable-data error does not (submitting retries).
 *
 * With no error recorded yet the form can still be invalid: in onChange
 * mode an untouched field (e.g. an empty amount, also right after a reset)
 * has no error until it changes. RHF's `isValid` runs the resolver in the
 * background for that, so it blocks too. Others (wallet not connected) are
 * left to the button.
 */
export const useSubmitError = <T extends FieldValues>(
  fields: readonly Path<T>[],
): SubmitError | null => {
  const { errors, isValid } = useFormState<T>();
  for (const field of fields) {
    const error: FieldError | undefined = get(errors, field);
    if (!error) continue;
    if (isValidationErrorTypeValidate(error.type)) {
      return { message: error.message || undefined, isBlocking: true };
    }
    if (error.type === DATA_UNAVAILABLE_ERROR) {
      return { message: error.message || undefined, isBlocking: false };
    }
  }
  return isValid ? null : { isBlocking: true };
};
