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

export const validate = <T>(schema: z.ZodType<T>, value: T): T | undefined => {
  try {
    return schema.parse(value);
  } catch (error) {
    console.error('Validation error:', error);
  }
};
