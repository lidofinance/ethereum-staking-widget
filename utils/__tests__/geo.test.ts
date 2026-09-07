import {
  getGeoAvailability,
  getGeoNoticeState,
  resolveGeoAvailability,
} from '../geo';

describe('resolveGeoAvailability', () => {
  it('passes through an explicit full', () => {
    expect(resolveGeoAvailability('full')).toBe('full');
  });

  it('passes through an explicit limited', () => {
    expect(resolveGeoAvailability('limited')).toBe('limited');
  });

  // fail-closed: everything that is not a literal `full` has to land on
  // `limited` — a request in flight, a failed one, a truncated body, a value
  // from a newer API version
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an unknown value', 'unrestricted'],
    ['a differently cased value', 'FULL'],
    ['a padded value', ' full '],
    ['a truthy non-string', 1],
    ['an object', { availability: 'full' }],
  ])('resolves %s to limited', (_label, value) => {
    expect(resolveGeoAvailability(value)).toBe('limited');
  });
});

describe('getGeoAvailability', () => {
  it('reports limited for a listed country', () => {
    expect(getGeoAvailability('US', ['US'])).toBe('limited');
  });

  it('reports full for a country that is not listed', () => {
    expect(getGeoAvailability('DE', ['US'])).toBe('full');
  });

  it('reports full when the list is empty', () => {
    expect(getGeoAvailability('US', [])).toBe('full');
  });

  // the schema uppercases both sides, but the handler and the QA mock must not
  // start disagreeing if that ever changes
  it.each([
    ['us', ['US']],
    ['US', ['us']],
    ['us', ['us']],
  ])('matches %o against %o regardless of case', (country, limited) => {
    expect(getGeoAvailability(country, limited)).toBe('limited');
  });
});

const BASE = {
  isChecking: false,
  isSlow: false,
  // the hook is fail-closed, so an in-flight check already reads as limited
  isLimited: true,
  // the common case is a country that resolved and turned out to be listed
  isUnresolved: false,
  showLimitedNotice: false,
};

describe('getGeoNoticeState', () => {
  it('reports the short copy while the check is in flight', () => {
    expect(getGeoNoticeState({ ...BASE, isChecking: true })).toBe('checking');
  });

  it('switches to the slow copy once the delay is exceeded', () => {
    expect(getGeoNoticeState({ ...BASE, isChecking: true, isSlow: true })).toBe(
      'checking-slow',
    );
  });

  // the deposit page mounts with `showLimitedNotice`, but the checking copy has
  // to win until the answer lands. This is also the prerender case: these pages
  // are statically generated, and a build that claimed "not available in your
  // region" would flash that at every visitor and mismatch on hydration
  it('prefers the checking copy over the limited one', () => {
    expect(
      getGeoNoticeState({
        ...BASE,
        isChecking: true,
        showLimitedNotice: true,
      }),
    ).toBe('checking');
  });

  it('reports the limited copy on a deposit page once the answer lands', () => {
    expect(getGeoNoticeState({ ...BASE, showLimitedNotice: true })).toBe(
      'limited',
    );
  });

  // withdraw and claim stay available in a limited region, so the message must
  // not appear there
  it('renders nothing for a limited region when the notice is not requested', () => {
    expect(getGeoNoticeState(BASE)).toBeNull();
  });

  it.each([[false], [true]])(
    'renders nothing for a full region (showLimitedNotice: %s)',
    (showLimitedNotice) => {
      expect(
        getGeoNoticeState({ ...BASE, isLimited: false, showLimitedNotice }),
      ).toBeNull();
    },
  );

  // isSlow is stale state left over from a previous check; it must not resurrect
  // the checking copy after the answer arrives
  it('ignores a stale slow flag once the check is done', () => {
    expect(
      getGeoNoticeState({ ...BASE, isSlow: true, isLimited: false }),
    ).toBeNull();
  });

  // no Cloudflare header, a failed request or a build without the route: the
  // region was never named, so the copy must not claim it is a restricted one
  it('reports the unresolved copy when no country came back', () => {
    expect(
      getGeoNoticeState({
        ...BASE,
        isUnresolved: true,
        showLimitedNotice: true,
      }),
    ).toBe('unresolved');
  });

  it('prefers the unresolved copy over the limited one', () => {
    expect(
      getGeoNoticeState({
        ...BASE,
        isUnresolved: true,
        isLimited: true,
        showLimitedNotice: true,
      }),
    ).toBe('unresolved');
  });

  it('prefers the checking copy over the unresolved one', () => {
    expect(
      getGeoNoticeState({
        ...BASE,
        isChecking: true,
        isUnresolved: true,
        showLimitedNotice: true,
      }),
    ).toBe('checking');
  });

  // withdraw stays available, and the copy talks about deposits, so it belongs
  // to the deposit page only
  it('renders nothing for an unresolved region when the notice is not requested', () => {
    expect(getGeoNoticeState({ ...BASE, isUnresolved: true })).toBeNull();
  });
});
