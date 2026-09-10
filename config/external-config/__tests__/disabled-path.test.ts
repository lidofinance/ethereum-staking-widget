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

  it('disables an IPFS hash path with a query string', () => {
    const pages = { '/': enabled, '/earn': disabled };
    expect(isDisabledPath('/earn/vault?tab=deposit', pages)).toBe(true);
  });

  it('allows enabled routes and unrelated disabled keys', () => {
    const pages = { '/': enabled, '/rewards': disabled, '/wrap': enabled };
    expect(isDisabledPath('/wrap/unwrap', pages)).toBe(false);
    expect(isDisabledPath('/', pages)).toBe(false);
  });

  it('allows everything when no pages are configured', () => {
    expect(isDisabledPath('/withdrawals/request', {})).toBe(false);
  });
});
