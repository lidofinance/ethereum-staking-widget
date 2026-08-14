import type { Address } from 'viem';
import { validateAddressLocally } from '../address-validation';

const BLOCKED = '0x1000000000000000000000000000000000000000' as Address;
const CLEAN = '0x2000000000000000000000000000000000000002' as Address;
// sha256 of the lowercased BLOCKED address (what sprig `sha256sum` /
// scripts/write-window-env.mjs produce)
const BLOCKED_HASH =
  'abf3d7911094951fb587cc7d427b68fdefebb3ea1ee8bc3f9d2272bff6516b36';

const toSet = ({ addresses }: { addresses: string[] }) => ({
  addresses: new Set(addresses.map((addr) => addr.toLowerCase())),
});

describe('validateAddressLocally', () => {
  it('matches plain-address entries case-insensitively', () => {
    const file = toSet({
      addresses: [BLOCKED.toUpperCase().replace('0X', '0x')],
    });
    expect(validateAddressLocally(BLOCKED, file).isValid).toBe(false);
    expect(validateAddressLocally(CLEAN, file).isValid).toBe(true);
  });

  it('matches sha256-hashed entries', () => {
    const file = toSet({ addresses: [BLOCKED_HASH] });
    expect(validateAddressLocally(BLOCKED, file).isValid).toBe(false);
    expect(validateAddressLocally(CLEAN, file).isValid).toBe(true);
  });

  it('matches hashed entries for any input casing', () => {
    const file = toSet({ addresses: [BLOCKED_HASH.toUpperCase()] });
    const mixedCase = BLOCKED.toUpperCase().replace('0X', '0x') as Address;
    expect(validateAddressLocally(mixedCase, file).isValid).toBe(false);
  });

  it('supports mixed plain and hashed files', () => {
    const file = toSet({
      addresses: [BLOCKED_HASH, '0x3000000000000000000000000000000000000003'],
    });
    expect(validateAddressLocally(BLOCKED, file).isValid).toBe(false);
    expect(
      validateAddressLocally('0x3000000000000000000000000000000000000003', file)
        .isValid,
    ).toBe(false);
    expect(validateAddressLocally(CLEAN, file).isValid).toBe(true);
  });

  it('treats an empty list as valid', () => {
    expect(
      validateAddressLocally(BLOCKED, toSet({ addresses: [] })).isValid,
    ).toBe(true);
  });
});
