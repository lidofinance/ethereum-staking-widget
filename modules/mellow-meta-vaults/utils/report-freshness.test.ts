import { describe, expect, it } from 'vitest';

import { isReportFresh } from './report-freshness';

const MAX_AGE = 86400n;
const REPORT_TIMESTAMP = 1_787_000_000n;

describe('isReportFresh', () => {
  it('accepts a report younger than maxAge', () => {
    expect(
      isReportFresh({
        reportTimestamp: REPORT_TIMESTAMP,
        maxAge: MAX_AGE,
        blockTimestamp: REPORT_TIMESTAMP + MAX_AGE - 1n,
      }),
    ).toBe(true);
  });

  it('accepts a report exactly maxAge old, as the contract does', () => {
    expect(
      isReportFresh({
        reportTimestamp: REPORT_TIMESTAMP,
        maxAge: MAX_AGE,
        blockTimestamp: REPORT_TIMESTAMP + MAX_AGE,
      }),
    ).toBe(true);
  });

  it('rejects a report older than maxAge', () => {
    expect(
      isReportFresh({
        reportTimestamp: REPORT_TIMESTAMP,
        maxAge: MAX_AGE,
        blockTimestamp: REPORT_TIMESTAMP + MAX_AGE + 1n,
      }),
    ).toBe(false);
  });

  it('rejects a missing report', () => {
    expect(
      isReportFresh({
        reportTimestamp: 0n,
        maxAge: MAX_AGE,
        blockTimestamp: REPORT_TIMESTAMP,
      }),
    ).toBe(false);
  });
});
