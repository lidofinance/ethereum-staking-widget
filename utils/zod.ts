import { z } from 'zod';
import { getAddress, isAddress, isHash, parseUnits, type Hash } from 'viem';

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

// ---------------------------------------------------------------------------
// Ethereum primitives, validated with viem so API strings can be trusted by
// the same code that later feeds them to viem
// ---------------------------------------------------------------------------

// Ethereum address, checksummed on output
export const ADDRESS_SCHEMA = z
  .string()
  .refine((value) => isAddress(value, { strict: false }), {
    message: 'Invalid Ethereum address',
  })
  .transform((value) => getAddress(value));

// 32-byte hash, e.g. a transaction hash
export const HASH_SCHEMA = z
  .string()
  .refine((value) => isHash(value), { message: 'Invalid hash' })
  .transform((value) => value as Hash);

// Unsigned integer string, e.g. a token amount in base units. Kept as string.
// Digits only: `BigInt()` would also accept '', whitespace and hex
export const BIGINT_STRING_SCHEMA = z
  .string()
  .regex(/^\d+$/u, { message: 'Expected an unsigned integer string' });

// ERC-20 decimals
export const TOKEN_DECIMALS_SCHEMA = z.number().int().min(0).max(255);

const toUnits = (value: string, decimals: number) => {
  try {
    const units = parseUnits(value, decimals);
    return units >= 0n ? units : null;
  } catch {
    return null;
  }
};

// Non-negative decimal string that `parseUnits` accepts: rejects NaN, exponent
// notation and negatives. Kept as string for callers that parse it themselves
export const DECIMAL_STRING_SCHEMA = z
  .string()
  .refine((value) => toUnits(value, 18) !== null, {
    message: 'Expected a non-negative decimal string',
  });

// Same input, converted to base units so no `Number` round trip is needed.
// Numbers are accepted and stringified first; 1e21+ turns into exponent
// notation and is rejected like any other unparseable value
export const decimalToUnitsSchema = (decimals: number) =>
  z
    .union([z.string(), z.number()])
    .pipe(z.coerce.string())
    .transform((value, ctx) => {
      const units = toUnits(value, decimals);
      if (units === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Expected a non-negative decimal value',
        });
        return z.NEVER;
      }
      return units;
    });
