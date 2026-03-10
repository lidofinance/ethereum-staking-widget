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

    it('Ledger Live stays disabled even with vault-specific URL params', () => {
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

  describe('vault-level opt-out via URL params', () => {
    it('?earn=ggv disables only the ggv vault', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'ggv',
        isReady: true,
      });
      expect(result.someVaultsDisabledByURL).toBe(true);
      expect(result.isVaultDisabledByUrl('ggv')).toBe(true);
      expect(result.isVaultDisabledByUrl('dvv')).toBe(false);
      expect(result.isVaultDisabledByUrl('strategy')).toBe(false);
      expect(result.isVaultEnabledByUrl('ggv')).toBe(false);
      expect(result.isVaultEnabledByUrl('dvv')).toBe(true);
    });

    it('?earn=ggv,dvv disables ggv and dvv, keeps strategy enabled', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'ggv,dvv',
        isReady: true,
      });
      expect(result.someVaultsDisabledByURL).toBe(true);
      expect(result.vaultsDisabledByUrl).toEqual(['ggv', 'dvv']);
      expect(result.isVaultDisabledByUrl('ggv')).toBe(true);
      expect(result.isVaultDisabledByUrl('dvv')).toBe(true);
      expect(result.isVaultDisabledByUrl('strategy')).toBe(false);
    });

    it('no URL params means no vaults disabled by URL', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: undefined,
        isReady: true,
      });
      expect(result.someVaultsDisabledByURL).toBe(false);
      expect(result.vaultsDisabledByUrl).toEqual([]);
      expect(result.isVaultDisabledByUrl('ggv')).toBe(false);
      expect(result.isVaultEnabledByUrl('ggv')).toBe(true);
    });

    it('?earn=enabled does not create vault-level disabled list', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'enabled',
        isReady: true,
      });
      expect(result.someVaultsDisabledByURL).toBe(false);
      expect(result.vaultsDisabledByUrl).toEqual([]);
    });

    it('?earn=disabled does not populate vault disabled list', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'disabled',
        isReady: true,
      });
      expect(result.someVaultsDisabledByURL).toBe(false);
      expect(result.vaultsDisabledByUrl).toEqual([]);
      expect(result.isEarnDisabledByRuntimeContext).toBe(true);
    });

    it('vault params not applied when router is not ready', () => {
      const result = computeEarnRuntimeState({
        isLedgerLive: false,
        earnParam: 'ggv,dvv',
        isReady: false,
      });
      expect(result.someVaultsDisabledByURL).toBe(false);
      expect(result.vaultsDisabledByUrl).toEqual([]);
    });
  });
});
