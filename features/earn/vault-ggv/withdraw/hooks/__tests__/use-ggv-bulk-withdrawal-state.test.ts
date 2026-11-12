import { zeroAddress, type PublicClient } from 'viem';

const { ACCOUNT, TELLER, VAULT, WETH } = vi.hoisted(() => ({
  ACCOUNT: '0x00000000000000000000000000000000000000aa' as const,
  TELLER: '0x4C74ccA483A278Bcb90Aea3f8F565e56202D82B2' as const,
  VAULT: '0xef417FCE1883c6653E7dC6AF7c6F85CCDE84Aa09' as const,
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as const,
}));

// bulkWithdraw(address,uint256,uint256,address), checked with `cast sig`
const BULK_WITHDRAW_SELECTOR = '0x3e64ce99';
const RATE = 1012681482084742508n;
const ONE = 10n ** 18n;

const state = vi.hoisted(() => ({
  isTellerPaused: vi.fn(),
  assetData: vi.fn(),
  accountantState: vi.fn(),
  getRate: vi.fn(),
  canCall: vi.fn(),
  readContract: vi.fn(),
}));

vi.mock('modules/web3', () => ({
  useDappStatus: () => ({}),
  useMainnetOnlyWagmi: () => ({}),
}));
vi.mock('config/networks/token-address', () => ({
  getTokenAddress: () => WETH,
}));
vi.mock('../../../contracts', async () => {
  const abi = await import('../../../contracts/abi/teller-abi');
  return {
    GGV_TELLER_ABI: abi.GGV_TELLER_ABI,
    getGGVTellerContract: () => ({
      address: TELLER,
      read: { isPaused: state.isTellerPaused, assetData: state.assetData },
    }),
    getGGVAccountantContract: () => ({
      read: {
        accountantState: state.accountantState,
        getRateInQuoteSafe: state.getRate,
      },
    }),
    getGGVVaultContract: () => ({
      address: VAULT,
      read: { decimals: async () => 18 },
    }),
    getGGVAuthorityContract: () => ({ read: { canCall: state.canCall } }),
  };
});

import { fetchGGVBulkWithdrawalState } from '../use-ggv-bulk-withdrawal-state';

const publicClient = {
  chain: { id: 1 },
  readContract: state.readContract,
} as unknown as PublicClient;

// AccountantWithRateProviders.accountantState(): isPaused is field 8
const accountantState = (isPaused: boolean) =>
  [zeroAddress, 0n, 0n, 0n, 0n, 0, 0, 0n, isPaused, 0, 0, 0] as const;

const fetchState = () => fetchGGVBulkWithdrawalState(publicClient, ACCOUNT);

beforeEach(() => {
  vi.clearAllMocks();
  // Mainnet state on 17 Nov after Veda opens the method
  state.isTellerPaused.mockResolvedValue(false);
  state.assetData.mockResolvedValue([false, true, 0]);
  state.accountantState.mockResolvedValue(accountantState(false));
  state.getRate.mockResolvedValue(RATE);
  state.canCall.mockResolvedValue(true);
  state.readContract.mockResolvedValue(1000n * ONE);
});

describe('fetchGGVBulkWithdrawalState', () => {
  it('allows the withdraw when every check passes', async () => {
    const result = await fetchState();

    expect(result).toEqual({
      canWithdraw: true,
      reason: null,
      rate: RATE,
      shareDecimals: 18,
      minimumShares: 1n,
      // 1000 WETH / 1.0127 WETH per share
      withdrawCapacity: (1000n * ONE * ONE) / RATE,
    });
  });

  it('reads the rate and liquidity for WETH', async () => {
    await fetchState();

    expect(state.assetData).toHaveBeenCalledWith([WETH]);
    expect(state.getRate).toHaveBeenCalledWith([WETH]);
    expect(state.readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: WETH,
        functionName: 'balanceOf',
        args: [VAULT],
      }),
    );
  });

  describe('permission gate', () => {
    it('asks the authority about bulkWithdraw on the Teller for the user', async () => {
      await fetchState();

      expect(state.canCall).toHaveBeenCalledWith([
        ACCOUNT,
        TELLER,
        BULK_WITHDRAW_SELECTOR,
      ]);
    });

    it('uses the zero address without a wallet, so only a public method passes', async () => {
      await fetchGGVBulkWithdrawalState(publicClient, undefined);

      expect(state.canCall).toHaveBeenCalledWith([
        zeroAddress,
        TELLER,
        BULK_WITHDRAW_SELECTOR,
      ]);
    });

    it('stops the withdraw until the method is open', async () => {
      state.canCall.mockResolvedValue(false);

      const result = await fetchState();

      expect(result.canWithdraw).toBe(false);
      expect(result.reason).toBe('bulk-withdraw-unavailable');
    });
  });

  describe('pause', () => {
    it('stops the withdraw when the Teller is paused', async () => {
      state.isTellerPaused.mockResolvedValue(true);

      const result = await fetchState();

      expect(result.canWithdraw).toBe(false);
      expect(result.reason).toBe('paused');
    });

    it('skips the rate read when the accountant is paused', async () => {
      state.accountantState.mockResolvedValue(accountantState(true));

      const result = await fetchState();

      // getRateInQuoteSafe reverts while paused
      expect(state.getRate).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        canWithdraw: false,
        reason: 'paused',
        rate: null,
        withdrawCapacity: null,
      });
    });

    it('reports pause before a closed method', async () => {
      state.isTellerPaused.mockResolvedValue(true);
      state.canCall.mockResolvedValue(false);

      expect((await fetchState()).reason).toBe('paused');
    });
  });

  describe('asset and liquidity', () => {
    it('stops the withdraw when WETH withdrawals are not allowed', async () => {
      state.assetData.mockResolvedValue([false, false, 0]);

      const result = await fetchState();

      expect(result.canWithdraw).toBe(false);
      expect(result.reason).toBe('withdrawal-stopped');
    });

    it('stops the withdraw when the vault has no WETH', async () => {
      state.readContract.mockResolvedValue(0n);

      const result = await fetchState();

      expect(result).toMatchObject({
        canWithdraw: false,
        reason: 'withdrawal-zero-capacity',
        withdrawCapacity: 0n,
      });
    });

    it('reports a closed method before zero liquidity', async () => {
      state.readContract.mockResolvedValue(0n);
      state.canCall.mockResolvedValue(false);

      expect((await fetchState()).reason).toBe('bulk-withdraw-unavailable');
    });
  });

  it('fails when a read fails, so the form does not show stale data', async () => {
    state.canCall.mockRejectedValue(new Error('Address not allowed'));

    await expect(fetchState()).rejects.toThrow('Address not allowed');
  });
});
