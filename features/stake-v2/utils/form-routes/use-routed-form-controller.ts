import { useMemo } from 'react';
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
} from 'react-hook-form';

import type { FormControllerContextValueType } from 'shared/hook-form/form-controller';
import type { ResetMode } from 'shared/hooks/use-wagmi-connection-changed-callback';

import type { FormRouting } from './routing';
import type { FormRouteSpec } from './types';

type UseRoutedFormControllerArgs<
  S extends FormRouteSpec,
  TInput extends FieldValues,
> = {
  routing: FormRouting<S>;
  /** the form: a route's `nextValues` are set on it */
  form: { setValue: UseFormSetValue<TInput> };
  /** after a successful submit; e.g. clear the amount, keep the picks */
  onReset: (values: TInput) => void;
  resetFormOn?: ResetMode;
};

/**
 * The FormController wiring of a routed form: submit runs the route, the
 * form follows the route's `nextValues` (funds a failed flow moved), and a
 * route's `retry` (the routing's retry event) submits again
 */
export const useRoutedFormController = <
  S extends FormRouteSpec,
  TInput extends FieldValues,
  TOutput extends FieldValues & S['values'],
>({
  routing,
  form: { setValue },
  onReset,
  resetFormOn = 'off',
}: UseRoutedFormControllerArgs<S, TInput>) => {
  return useMemo(
    (): FormControllerContextValueType<TInput, TOutput> => ({
      onSubmit: async (values) => {
        const { isSuccess, nextValues = {} } = await routing.submit(values);
        for (const [name, value] of Object.entries(nextValues)) {
          setValue(
            name as Path<TInput>,
            value as PathValue<TInput, Path<TInput>>,
            { shouldValidate: true },
          );
        }
        return isSuccess;
      },
      onReset,
      retryEvent: routing.retryEvent,
      resetFormOn,
    }),
    [routing, setValue, onReset, resetFormOn],
  );
};
