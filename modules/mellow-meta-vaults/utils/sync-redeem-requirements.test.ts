import { describe, expect, it } from 'vitest';

import { meetsSyncRedeemRequirements } from './sync-redeem-requirements';

describe('meetsSyncRedeemRequirements', () => {
  it('uses the sync queue when both limits cover the request', () => {
    expect(
      meetsSyncRedeemRequirements({
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
        requestedShares: 10n,
        requestedAssets: 10n,
        remainingDailyLimit: 20n,
        liquidAssets: 9n,
      }),
    ).toBe(false);
  });

  it('compares share and asset limits in their respective token units', () => {
    expect(
      meetsSyncRedeemRequirements({
        requestedShares: 1_000_000_000_000_000_000n,
        requestedAssets: 1_021_236n,
        remainingDailyLimit: 12_000_000_000_000_000_000_000n,
        liquidAssets: 68_966_160_533n,
      }),
    ).toBe(true);
  });
});
