import { CACHE_VALIDATION_HEADERS } from '../cache';

describe('CACHE_VALIDATION_HEADERS', () => {
  // a CDN must not serve a stale `isValid: true` for a newly prohibited address
  it('is a short public max-age with no stale serving', () => {
    expect(CACHE_VALIDATION_HEADERS).toBe('public, max-age=30');
    expect(CACHE_VALIDATION_HEADERS).not.toMatch(/stale-/);
  });
});
