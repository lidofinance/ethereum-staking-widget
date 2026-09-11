import { describe, expect, it } from 'vitest';

import { meetsSyncRedeemRequirements } from './sync-redeem-requirements';

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
