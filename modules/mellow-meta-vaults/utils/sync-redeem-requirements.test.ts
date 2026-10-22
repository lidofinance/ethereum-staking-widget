import { describe, expect, it } from 'vitest';

import {
  isSyncRedeemReportUsable,
  meetsSyncRedeemRequirements,
} from './sync-redeem-requirements';

describe('meetsSyncRedeemRequirements', () => {
  it('uses the sync queue when both limits cover the request', () => {
    expect(
      meetsSyncRedeemRequirements({
        isWithdrawalPossible: true,
        requestedShares: 10n,
        requestedAssets: 10n,
        remainingDailyLimit: 11n,
        liquidAssets: 12n,
      }),
    ).toBe(true);
  });

  it('allows a request equal to both limits', () => {
    expect(
      meetsSyncRedeemRequirements({
        isWithdrawalPossible: true,
        requestedShares: 10n,
        requestedAssets: 10n,
        remainingDailyLimit: 10n,
        liquidAssets: 10n,
      }),
    ).toBe(true);
  });

  it('uses the async queue when the daily limit is insufficient', () => {
    expect(
      meetsSyncRedeemRequirements({
        isWithdrawalPossible: true,
        requestedShares: 10n,
        requestedAssets: 10n,
        remainingDailyLimit: 9n,
        liquidAssets: 20n,
      }),
    ).toBe(false);
  });

  it('uses the async queue when liquid assets are insufficient', () => {
    expect(
      meetsSyncRedeemRequirements({
        isWithdrawalPossible: true,
        requestedShares: 10n,
        requestedAssets: 10n,
        remainingDailyLimit: 20n,
        liquidAssets: 9n,
      }),
    ).toBe(false);
  });

  // ETHV-WD-ROUTE-01: a paused sync queue quotes zero assets, which must not
  // read as "enough liquidity"
  it('uses the async queue when the Collector says the sync withdrawal is impossible', () => {
    expect(
      meetsSyncRedeemRequirements({
        isWithdrawalPossible: false,
        requestedShares: 10n,
        requestedAssets: 0n,
        remainingDailyLimit: 20n,
        liquidAssets: 20n,
      }),
    ).toBe(false);
  });

  it('uses the async queue when the quote returns zero assets for a positive request', () => {
    expect(
      meetsSyncRedeemRequirements({
        isWithdrawalPossible: true,
        requestedShares: 10n,
        requestedAssets: 0n,
        remainingDailyLimit: 20n,
        liquidAssets: 20n,
      }),
    ).toBe(false);
  });

  it('compares share and asset limits in their respective token units', () => {
    expect(
      meetsSyncRedeemRequirements({
        isWithdrawalPossible: true,
        requestedShares: 1_000_000_000_000_000_000n,
        requestedAssets: 1_021_236n,
        remainingDailyLimit: 12_000_000_000_000_000_000_000n,
        liquidAssets: 68_966_160_533n,
      }),
    ).toBe(true);
  });
});

// ETHV-WD-ROUTE-05: the queue reverts with StaleReport on an expired report,
// which the Collector quote does not reflect
describe('isSyncRedeemReportUsable', () => {
  const now = 1_700_000_000;
  const fresh = {
    priceD18: 10n ** 18n,
    timestamp: now - 600,
    isSuspicious: false,
  };

  it('accepts a fresh, non-suspicious, priced report', () => {
    expect(
      isSyncRedeemReportUsable({
        report: fresh,
        maxAge: 3600,
        nowSeconds: now,
      }),
    ).toBe(true);
  });

  it('accepts a report exactly at its maximum age, like the contract', () => {
    expect(
      isSyncRedeemReportUsable({
        report: { ...fresh, timestamp: now - 3600 },
        maxAge: 3600,
        nowSeconds: now,
      }),
    ).toBe(true);
  });

  it('rejects a report older than maxAge', () => {
    expect(
      isSyncRedeemReportUsable({
        report: { ...fresh, timestamp: now - 3601 },
        maxAge: 3600,
        nowSeconds: now,
      }),
    ).toBe(false);
  });

  it('rejects a suspicious report and a zero price', () => {
    expect(
      isSyncRedeemReportUsable({
        report: { ...fresh, isSuspicious: true },
        maxAge: 3600,
        nowSeconds: now,
      }),
    ).toBe(false);
    expect(
      isSyncRedeemReportUsable({
        report: { ...fresh, priceD18: 0n },
        maxAge: 3600,
        nowSeconds: now,
      }),
    ).toBe(false);
  });
});
