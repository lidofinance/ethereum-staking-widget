import type { z } from 'zod';

import { ValidationError } from 'shared/hook-form/validation/validation-error';

/**
 * Issue params of a check that blocks without a text (e.g. no amount yet).
 * zod swaps an empty message for its default "Invalid input", so silence
 * is marked here and applied by parseOrThrow.
 */
export const SILENT_ISSUE = { silent: true } as const;

const isSilent = (issue: z.core.$ZodIssue) =>
  issue.code === 'custom' &&
  (issue.params as { silent?: boolean } | undefined)?.silent === true;

/**
 * Parses `values` with `schema`; the first issue becomes a ValidationError
 * on its top-level field, the way the resolvers report errors. A silent
 * issue (SILENT_ISSUE) gets an empty message: it blocks, with no text.
 */
export const parseOrThrow = <T>(
  schema: z.ZodType<T>,
  values: unknown,
  fallbackField = 'amount',
): T => {
  const result = schema.safeParse(values);
  if (result.success) return result.data;
  const [issue] = result.error.issues;
  throw new ValidationError(
    String(issue?.path[0] ?? fallbackField),
    !issue || isSilent(issue) ? '' : issue.message,
  );
};
