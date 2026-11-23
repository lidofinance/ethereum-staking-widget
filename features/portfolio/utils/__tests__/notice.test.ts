import {
  getActivityMessage,
  getOtherEmptyText,
  getPortfolioNotice,
  getStaleNotice,
} from '../notice';

const NONE = {
  isLimited: false,
  isFallback: false,
  isStale: false,
  isError: false,
  isIncomplete: false,
};
// Jul 9, 2025, 16:30 local time
const TIME = new Date(2025, 6, 9, 16, 30).getTime();

describe('getPortfolioNotice', () => {
  it('says nothing when all is well', () => {
    expect(getPortfolioNotice(NONE)).toBeUndefined();
  });

  it('tells the time of an older answer', () => {
    expect(
      getPortfolioNotice({ ...NONE, isStale: true, updatedAt: TIME }),
    ).toBe(
      'Live data is temporarily unavailable. Showing data as of Jul 9, 2025, 16:30.',
    );
  });

  it('tells that only main tokens are shown, and why', () => {
    expect(
      getPortfolioNotice({ ...NONE, isFallback: true, isError: true }),
    ).toBe(
      'Live data is temporarily unavailable. Only main tokens are shown, totals may be lower.',
    );
    expect(
      getPortfolioNotice({ ...NONE, isFallback: true, isLimited: true }),
    ).toBe(
      'Request limit reached, try again later. Only main tokens are shown, totals may be lower.',
    );
  });

  it('does not promise main tokens when there are none', () => {
    expect(
      getPortfolioNotice({ ...NONE, isFallback: true, isFallbackEmpty: true }),
    ).toBe('Live data is temporarily unavailable. Totals may be lower.');
  });

  it('keeps the older notices for the remaining cases', () => {
    expect(getPortfolioNotice({ ...NONE, isError: true })).toBe(
      'Some data could not be loaded, totals may be lower.',
    );
    expect(getPortfolioNotice({ ...NONE, isIncomplete: true })).toBe(
      'Some assets are not shown, totals may be lower.',
    );
  });

  it('tells about rewards only when nothing else is wrong', () => {
    expect(
      getPortfolioNotice({
        ...NONE,
        isRewardsStale: true,
        rewardsUpdatedAt: TIME,
      }),
    ).toBe(
      'Live data is temporarily unavailable. Showing rewards as of Jul 9, 2025, 16:30.',
    );
    expect(getPortfolioNotice({ ...NONE, isRewardsError: true })).toBe(
      'Rewards are temporarily unavailable.',
    );
    expect(
      getPortfolioNotice({ ...NONE, isError: true, isRewardsError: true }),
    ).toBe('Some data could not be loaded, totals may be lower.');
  });
});

describe('getStaleNotice', () => {
  it('names what is shown', () => {
    expect(getStaleNotice(TIME, 'activity')).toBe(
      'Live data is temporarily unavailable. Showing activity as of Jul 9, 2025, 16:30.',
    );
  });
});

describe('getActivityMessage', () => {
  const EMPTY = 'No activity found';

  it('says nothing when rows are shown and nothing failed', () => {
    expect(getActivityMessage(false, false, false, EMPTY)).toBeNull();
  });

  it('gives the empty text for an empty list', () => {
    expect(getActivityMessage(true, false, false, EMPTY)).toBe(EMPTY);
  });

  it('tells a failure whether or not rows are shown', () => {
    const text = 'Activity is temporarily unavailable';
    expect(getActivityMessage(true, true, false, EMPTY)).toBe(text);
    expect(getActivityMessage(false, true, false, EMPTY)).toBe(text);
  });

  it('names the request limit before anything else', () => {
    const text = 'Request limit reached, try again later';
    expect(getActivityMessage(true, true, true, EMPTY)).toBe(text);
    expect(getActivityMessage(false, false, true, EMPTY)).toBe(text);
  });
});

describe('getOtherEmptyText', () => {
  it('tells an empty wallet, an outage and the limit apart', () => {
    expect(getOtherEmptyText(false, false)).toBe('No other holdings found');
    expect(getOtherEmptyText(true, false)).toBe(
      'Other holdings are temporarily unavailable',
    );
    expect(getOtherEmptyText(true, true)).toBe(
      'Request limit reached, try again later',
    );
  });
});
