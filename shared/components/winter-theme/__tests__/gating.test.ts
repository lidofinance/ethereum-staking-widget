import { isWinterThemeAllowed, isWinterThemeRequested } from '../constants';

describe('winter theme gating', () => {
  it('is requested whenever the theme is forced on this branch', () => {
    // WINTER_THEME_FORCED is a temporary review switch, see constants.ts
    expect(isWinterThemeRequested(true)).toBe(true);
    expect(isWinterThemeRequested(false)).toBe(true);
    expect(isWinterThemeRequested(undefined)).toBe(true);
  });

  it('is allowed on the site itself', () => {
    expect(
      isWinterThemeAllowed({
        requested: true,
        isIframe: false,
        appFlag: undefined,
      }),
    ).toBe(true);
  });

  it('is never allowed inside an iframe (Safe)', () => {
    expect(
      isWinterThemeAllowed({
        requested: true,
        isIframe: true,
        appFlag: undefined,
      }),
    ).toBe(false);
  });

  it('is never allowed inside Ledger Live', () => {
    expect(
      isWinterThemeAllowed({
        requested: true,
        isIframe: false,
        appFlag: 'ledger-live',
      }),
    ).toBe(false);
  });

  it('is off when not requested', () => {
    expect(
      isWinterThemeAllowed({
        requested: false,
        isIframe: false,
        appFlag: undefined,
      }),
    ).toBe(false);
  });
});
