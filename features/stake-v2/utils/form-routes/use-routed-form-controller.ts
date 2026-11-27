import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';

import {
  useFormControllerRetry,
  type FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import type { ResetMode } from 'shared/hooks/use-wagmi-connection-changed-callback';

import type { FormRouting } from './routing';
import type { FormRouteSpec } from './types';

type UseRoutedFormControllerArgs<
  S extends FormRouteSpec,
  TInput extends FieldValues,
> = {
  routing: FormRouting<S>;
  /** after a successful submit; e.g. clear the amount, keep the picks */
  onReset: (values: TInput) => void;
  resetFormOn?: ResetMode;
};

/** the FormController wiring of a routed form: submit runs the route */
export const useRoutedFormController = <
  S extends FormRouteSpec,
  TInput extends FieldValues,
  TOutput extends FieldValues & S['values'],
>({
  routing,
  onReset,
  resetFormOn = 'off',
}: UseRoutedFormControllerArgs<S, TInput>) => {
  const { retryEvent } = useFormControllerRetry();
  return useMemo(
    (): FormControllerContextValueType<TInput, TOutput> => ({
      onSubmit: routing.submit,
      onReset,
      retryEvent,
      resetFormOn,
    }),
    [routing, onReset, retryEvent, resetFormOn],
  );
};
