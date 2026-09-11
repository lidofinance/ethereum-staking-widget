import { isDisabledPath } from '../utils';

const disabled = { shouldDisable: true, showNew: false, sections: [] };
const enabled = { shouldDisable: false, showNew: false, sections: [] };

// SW-ROUTE-ADMIT-02: `/` matches every path and must not mask disabled keys
describe('isDisabledPath', () => {
  it('disables a route when `/` is listed first', () => {
    const pages = { '/': enabled, '/withdrawals': disabled };
    expect(isDisabledPath('/withdrawals/request', pages)).toBe(true);
  });

  it('disables a route when `/` is listed last', () => {
    const pages = { '/withdrawals': disabled, '/': enabled };
    expect(isDisabledPath('/withdrawals/request', pages)).toBe(true);
  });

  it('disables the exact page and its children', () => {
    const pages = { '/': enabled, '/earn': disabled };
    expect(isDisabledPath('/earn', pages)).toBe(true);
    expect(isDisabledPath('/earn/', pages)).toBe(true);
    expect(isDisabledPath('/earn/vault/deposit', pages)).toBe(true);
  });

  it('disables an IPFS hash path with a query string', () => {
    const pages = { '/': enabled, '/earn': disabled };
    expect(isDisabledPath('/earn/vault?tab=deposit', pages)).toBe(true);
    expect(isDisabledPath('/earn/?tab=deposit', pages)).toBe(true);
    expect(isDisabledPath('/earn#section', pages)).toBe(true);
  });

  it('ignores a disabled page key that only appears in the query', () => {
    const pages = { '/': enabled, '/earn': disabled, '/wrap': enabled };
    expect(isDisabledPath('/wrap?next=/earn', pages)).toBe(false);
    expect(isDisabledPath('/wrap?ref=earn/vault', pages)).toBe(false);
    expect(isDisabledPath('/?redirect=%2Fearn&x=/earn', pages)).toBe(false);
    expect(isDisabledPath('/wrap#/earn', pages)).toBe(false);
  });

  it('does not match a route that merely starts with the key text', () => {
    const pages = { '/': enabled, '/earn': disabled };
    expect(isDisabledPath('/earnings', pages)).toBe(false);
    expect(isDisabledPath('/wrap/earn', pages)).toBe(false);
  });

  it('allows enabled routes and unrelated disabled keys', () => {
    const pages = { '/': enabled, '/rewards': disabled, '/wrap': enabled };
    expect(isDisabledPath('/wrap/unwrap', pages)).toBe(false);
    expect(isDisabledPath('/', pages)).toBe(false);
  });

  it('only matches `/` exactly even if it were disabled', () => {
    const pages = { '/': disabled, '/wrap': enabled };
    expect(isDisabledPath('/', pages)).toBe(true);
    expect(isDisabledPath('/wrap', pages)).toBe(false);
  });

  it('allows everything when no pages are configured', () => {
    expect(isDisabledPath('/withdrawals/request', {})).toBe(false);
  });
});
