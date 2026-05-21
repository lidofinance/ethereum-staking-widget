import {
  rewardsQuerySchema,
  MAX_LIMIT,
  MAX_SKIP,
} from '../rewards-query-schema';

const VALID_ADDRESS = '0x' + '0'.repeat(40);

describe('rewardsQuerySchema', () => {
  it('accepts a valid minimal query (address only)', () => {
    const r = rewardsQuerySchema.safeParse({ address: VALID_ADDRESS });
    expect(r.success).toBe(true);
  });

  it('accepts a typical UI page request', () => {
    const r = rewardsQuerySchema.safeParse({
      address: VALID_ADDRESS,
      currency: 'USD',
      skip: '0',
      limit: '10',
      archiveRate: 'true',
      onlyRewards: 'false',
    });
    expect(r.success).toBe(true);
  });

  it('rejects invalid address format', () => {
    const r = rewardsQuerySchema.safeParse({ address: '0xdeadbeef' });
    expect(r.success).toBe(false);
  });

  it('rejects address without 0x prefix', () => {
    const r = rewardsQuerySchema.safeParse({ address: '0'.repeat(40) });
    expect(r.success).toBe(false);
  });

  it('rejects missing address', () => {
    const r = rewardsQuerySchema.safeParse({ limit: '10' });
    expect(r.success).toBe(false);
  });

  it('rejects limit above MAX_LIMIT', () => {
    const r = rewardsQuerySchema.safeParse({
      address: VALID_ADDRESS,
      limit: String(MAX_LIMIT + 1),
    });
    expect(r.success).toBe(false);
  });

  it('accepts limit exactly at MAX_LIMIT', () => {
    const r = rewardsQuerySchema.safeParse({
      address: VALID_ADDRESS,
      limit: String(MAX_LIMIT),
    });
    expect(r.success).toBe(true);
  });

  it('rejects limit=1000000 (the bounty PoC)', () => {
    const r = rewardsQuerySchema.safeParse({
      address: VALID_ADDRESS,
      limit: '1000000',
    });
    expect(r.success).toBe(false);
  });

  it('rejects skip above MAX_SKIP', () => {
    const r = rewardsQuerySchema.safeParse({
      address: VALID_ADDRESS,
      skip: String(MAX_SKIP + 1),
    });
    expect(r.success).toBe(false);
  });

  it('rejects negative limit / skip', () => {
    expect(
      rewardsQuerySchema.safeParse({ address: VALID_ADDRESS, limit: '-1' })
        .success,
    ).toBe(false);
    expect(
      rewardsQuerySchema.safeParse({ address: VALID_ADDRESS, skip: '-1' })
        .success,
    ).toBe(false);
  });

  it('rejects non-integer limit / skip', () => {
    expect(
      rewardsQuerySchema.safeParse({ address: VALID_ADDRESS, limit: '1.5' })
        .success,
    ).toBe(false);
  });

  it('rejects unknown query keys (strict mode)', () => {
    const r = rewardsQuerySchema.safeParse({
      address: VALID_ADDRESS,
      _: 'cache-buster',
    });
    expect(r.success).toBe(false);

    const r2 = rewardsQuerySchema.safeParse({
      address: VALID_ADDRESS,
      pad: 'whatever',
    });
    expect(r2.success).toBe(false);
  });

  it('rejects oversized currency code', () => {
    const r = rewardsQuerySchema.safeParse({
      address: VALID_ADDRESS,
      currency: 'A'.repeat(100),
    });
    expect(r.success).toBe(false);
  });
});
