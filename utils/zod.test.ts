import { getAddress } from 'viem';

import {
  ADDRESS_SCHEMA,
  BIGINT_STRING_SCHEMA,
  DECIMAL_STRING_SCHEMA,
  decimalToUnitsSchema,
} from './zod';

const LOWER = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';

describe('ADDRESS_SCHEMA', () => {
  it('accepts any valid casing and returns the checksummed address', () => {
    expect(ADDRESS_SCHEMA.parse(LOWER)).toBe(getAddress(LOWER));
  });
  it.each(['0x12', 'not-an-address', 42])('rejects %p', (value) => {
    expect(ADDRESS_SCHEMA.safeParse(value).success).toBe(false);
  });
});

describe('BIGINT_STRING_SCHEMA', () => {
  it.each(['0', '1000000000000000000000000'])('accepts %p', (value) => {
    expect(BIGINT_STRING_SCHEMA.safeParse(value).success).toBe(true);
  });
  it.each(['-1', '1.5', '1e21', 'abc', ''])('rejects %p', (value) => {
    expect(BIGINT_STRING_SCHEMA.safeParse(value).success).toBe(false);
  });
});

describe('decimal schemas', () => {
  it.each(['0', '1', '123.456789', '999999999999999999999.999'])(
    'accept %p',
    (value) => {
      expect(DECIMAL_STRING_SCHEMA.safeParse(value).success).toBe(true);
      expect(decimalToUnitsSchema(18).safeParse(value).success).toBe(true);
    },
  );
  it.each(['NaN', '1e21', '-1', 'abc', 'Infinity'])('reject %p', (value) => {
    expect(DECIMAL_STRING_SCHEMA.safeParse(value).success).toBe(false);
    expect(decimalToUnitsSchema(18).safeParse(value).success).toBe(false);
  });
  it('converts to base units at the given decimals', () => {
    expect(decimalToUnitsSchema(6).parse('1.5')).toBe(1_500_000n);
    expect(decimalToUnitsSchema(6).parse(2)).toBe(2_000_000n);
  });
});
