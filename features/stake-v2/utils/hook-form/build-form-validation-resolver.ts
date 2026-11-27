import type {
  FieldErrors,
  FieldValues,
  Resolver,
  ResolverResult,
} from 'react-hook-form';
import invariant from 'tiny-invariant';
import { toast } from '@lidofinance/lido-app-ui';
import type { z } from 'zod';

import {
  handleResolverValidationError,
  walletNotConnectedResult,
  type ResolverErrorResult,
} from 'shared/hook-form/validation/validation-error';

import type { FormRouteSpec, FormRouting } from '../form-routes';
import { errorTexts } from '../error-texts';
import { parseOrThrow } from '../validation';

import { DATA_UNAVAILABLE_ERROR } from './use-submit-error';

type RoutingStep<TContext, S extends FormRouteSpec> = {
  /** the form's routing, from the validation context */
  getRouting: (context: TContext) => FormRouting<S>;
};

type BuildFormValidationResolverArgs<
  TInput extends FieldValues,
  TContext,
  TOutput extends FieldValues,
  S extends FormRouteSpec,
> = {
  /** for logs and the unknown-error toast */
  formName: string;
  /** field for errors that belong to no field (kept registered, hidden) */
  fallbackField: string;
  /**
   * fixes what the UI has not caught up with yet (e.g. a stale token
   * pair); submit gets the resolver's values, so the fixed ones are used
   */
  normalize?: (values: TInput, context: TContext) => TInput;
  /** the form's shape; its output is what submit gets */
  schema: z.ZodType<TOutput, TInput>;
  /** for forms with several flows: the picked route's checks */
  routing?: RoutingStep<TContext, S>;
};

// the shared results are keyed by field name; RHF types them per form
const asFormError = <TInput extends FieldValues, TOutput>({
  errors,
}: ResolverErrorResult): ResolverResult<TInput, TOutput> => ({
  values: {},
  errors: errors as FieldErrors<TInput>,
});

/**
 * The route context could not be read (RPC down, after the query's own
 * retries): a toast says so, once per form (it replaces itself while the
 * user keeps typing). The error sits on the hidden fallback field with its
 * own type, so it blocks this submit but not the button: submitting again
 * validates, and reads, again.
 */
const dataUnavailableResult = (
  formName: string,
  field: string,
): ResolverErrorResult => {
  const message = errorTexts.forms.general.networkDataUnavailable();
  toast(
    { title: message, status: 'error' },
    { id: `${formName}-network-data`, assertive: true },
  );
  return {
    values: {},
    errors: { [field]: { type: DATA_UNAVAILABLE_ERROR, message } },
  };
};

/**
 * The one way the v2 forms validate:
 * 1. normalize, 2. the form's zod schema, then for routed forms
 * 3. pick the route, 4. read its context (only this route's, from cache
 * when fresh), 5. the route's zod schema. The first issue becomes the
 * error; a context that cannot be read is "data unavailable".
 *
 * No timeout: step 4 awaits a real read that settles on its own, and
 * isValidating covers the wait. Wrap the result with useLatestResolver so
 * a superseded validation takes the latest result.
 */
export const buildFormValidationResolver = <
  TInput extends FieldValues,
  TContext,
  TOutput extends FieldValues,
  S extends FormRouteSpec = FormRouteSpec,
>({
  formName,
  fallbackField,
  normalize,
  schema,
  routing,
}: BuildFormValidationResolverArgs<TInput, TContext, TOutput, S>): Resolver<
  TInput,
  TContext,
  TOutput
> => {
  return async (values, context): Promise<ResolverResult<TInput, TOutput>> => {
    const fail = (result: ResolverErrorResult) =>
      asFormError<TInput, TOutput>(result);
    try {
      invariant(context, `[${formName}] validation context is required`);

      const fixed = normalize ? normalize(values, context) : values;
      const validated = parseOrThrow(schema, fixed, fallbackField);

      if (routing) {
        const formRouting = routing.getRouting(context);
        const pair = formRouting.toPair(validated);
        // none is a bug: the form keeps its pair to the routes' options
        const route = formRouting.resolve(pair);
        invariant(route, `[${formName}] the values must have a route`);

        // route contexts need the environment, the account above all
        if (!formRouting.getDeps(pair)) {
          return fail(walletNotConnectedResult(fallbackField));
        }

        let routeContext: unknown;
        try {
          routeContext = await formRouting.requester.request(route, pair);
        } catch (error) {
          console.warn(`[${formName}] route context read failed`, error);
          return fail(dataUnavailableResult(formName, fallbackField));
        }

        parseOrThrow(route.getSchema(routeContext, pair), validated);
      }

      return { values: validated, errors: {} };
    } catch (error) {
      return fail(
        handleResolverValidationError(error, formName, fallbackField),
      );
    }
  };
};
