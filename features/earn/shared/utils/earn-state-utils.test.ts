import { computeEarnRuntimeState } from './earn-state-utils';

describe('computeEarnRuntimeState (opt-out semantics)', () => {
  describe('isEarnDisabledByRuntimeContext', () => {
    it('is disabled for Ledger Live regardless of URL params', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: true,
        earnParam: undefined,
        isReady: true,
      });
      expect(result.isEarnDisabledByRuntimeContext).toBe(true);
    });

    it('Ledger Live cannot be enabled via ?earn=enabled', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: true,
        earnParam: 'enabled',
        isReady: true,
      });
      expect(result.isEarnDisabledByRuntimeContext).toBe(true);
    });

    it('Ledger Live stays disabled even with vault allowlist URL params', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: true,
        earnParam: 'ggv,dvv',
        isReady: true,
      });
      expect(result.isEarnDisabledByRuntimeContext).toBe(true);
    });

    it('is enabled by default for non-Ledger-Live (no URL params)', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: undefined,
        isReady: true,
      });
      expect(result.isEarnDisabledByRuntimeContext).toBe(false);
    });

    it('is disabled when ?earn=disabled URL param is set', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'disabled',
        isReady: true,
      });
      expect(result.isEarnDisabledByRuntimeContext).toBe(true);
    });

    it('is not disabled when ?earn=enabled URL param is set (no-op in opt-out)', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'enabled',
        isReady: true,
      });
      expect(result.isEarnDisabledByRuntimeContext).toBe(false);
    });

    it('is not disabled when router is not ready, even with ?earn=disabled', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'disabled',
        isReady: false,
      });
      expect(result.isEarnDisabledByRuntimeContext).toBe(false);
    });

    it('Ledger Live is still disabled when router is not ready', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: true,
        earnParam: undefined,
        isReady: false,
      });
      expect(result.isEarnDisabledByRuntimeContext).toBe(true);
    });
  });

  describe('vault-level allowlist via URL params', () => {
    it('?earn=ggv shows only ggv; dvv and strategy are hidden', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'ggv',
        isReady: true,
      });
      expect(result.someVaultsEnabledByURL).toBe(true);
      expect(result.isVaultEnabledByUrl('ggv')).toBe(true);
      expect(result.isVaultEnabledByUrl('dvv')).toBe(false);
      expect(result.isVaultEnabledByUrl('strategy')).toBe(false);
      expect(result.isVaultDisabledByUrl('ggv')).toBe(false);
      expect(result.isVaultDisabledByUrl('dvv')).toBe(true);
    });

    it('?earn=ggv,dvv shows only ggv and dvv; strategy is hidden', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'ggv,dvv',
        isReady: true,
      });
      expect(result.someVaultsEnabledByURL).toBe(true);
      expect(result.vaultsEnabledByUrl).toEqual(['ggv', 'dvv']);
      expect(result.isVaultEnabledByUrl('ggv')).toBe(true);
      expect(result.isVaultEnabledByUrl('dvv')).toBe(true);
      expect(result.isVaultEnabledByUrl('strategy')).toBe(false);
    });

    it('no URL params means no vault allowlist (all vaults shown)', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: undefined,
        isReady: true,
      });
      expect(result.someVaultsEnabledByURL).toBe(false);
      expect(result.vaultsEnabledByUrl).toEqual([]);
      expect(result.isVaultEnabledByUrl('ggv')).toBe(false);
      expect(result.isVaultDisabledByUrl('ggv')).toBe(true);
    });

    it('?earn=enabled does not create a vault allowlist', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'enabled',
        isReady: true,
      });
      expect(result.someVaultsEnabledByURL).toBe(false);
      expect(result.vaultsEnabledByUrl).toEqual([]);
    });

    it('?earn=disabled does not populate vault allowlist', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'disabled',
        isReady: true,
      });
      expect(result.someVaultsEnabledByURL).toBe(false);
      expect(result.vaultsEnabledByUrl).toEqual([]);
      expect(result.isEarnDisabledByRuntimeContext).toBe(true);
    });

    it('vault allowlist not applied when router is not ready', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'ggv,dvv',
        isReady: false,
      });
      expect(result.someVaultsEnabledByURL).toBe(false);
      expect(result.vaultsEnabledByUrl).toEqual([]);
    });
  });
});
