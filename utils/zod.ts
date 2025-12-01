import * as z from 'zod';

// Unix timestamp validator (seconds, valid until year 2286)
export const UNIX_TIMESTAMP_SCHEMA = z.coerce
  .number<number>()
  .int()
  .min(0)
  .max(10_000_000_000);

// Generic schema for numeric values – number or numeric string with string -> number coercion
export const NUMERIC_SCHEMA = z
  .union([z.number(), z.string()])
  .pipe(z.coerce.number());

export const APY_SCHEMA = NUMERIC_SCHEMA;

// Percentage validator (0 to 100), not suitable for APY which can be <0 and >100
export const PERCENT_SCHEMA = z.number().min(0).max(100);

export const logZodParseErrors = (
  ...parseResults: Array<z.ZodSafeParseResult<any>>
) => {
  parseResults.forEach((result) => {
    if (!result.success) {
      console.error(result.error);
    }
  });
};
