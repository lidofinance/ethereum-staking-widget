import { describe, it, expect, expectTypeOf } from 'vitest';

import { COWSWAP_TOKEN_KEYS } from '../networks';
import type { DexTokenContractKey } from '../guards/tx/utils/types';

describe('COWSWAP_TOKEN_KEYS', () => {
  it('lists every DexTokenContractKey once', () => {
    // checked by tsc
    expectTypeOf<
      (typeof COWSWAP_TOKEN_KEYS)[number]
    >().toEqualTypeOf<DexTokenContractKey>();
    expect(new Set(COWSWAP_TOKEN_KEYS).size).toBe(COWSWAP_TOKEN_KEYS.length);
  });
});
