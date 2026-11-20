import { describe, expect, it } from 'vitest';

import { CACHE_CONTROL_PAGES } from '../../../next.config.mjs';
import {
  EARN_VAULTS,
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from '../consts';

// test/headers.spec.ts derives its cases from CACHE_CONTROL_PAGES, so dropping
// a route there also drops its test. This asserts the link independently.
describe('earn routes in CACHE_CONTROL_PAGES', () => {
  it.each(EARN_VAULTS)('covers every %s route', (vault) => {
    // redirect stub from pages/earn/[vault], then both action pages
    expect(CACHE_CONTROL_PAGES).toContain(`/earn/${vault}`);
    expect(CACHE_CONTROL_PAGES).toContain(
      `/earn/${vault}/${EARN_VAULT_DEPOSIT_SLUG}`,
    );
    expect(CACHE_CONTROL_PAGES).toContain(
      `/earn/${vault}/${EARN_VAULT_WITHDRAW_SLUG}`,
    );
  });
});
