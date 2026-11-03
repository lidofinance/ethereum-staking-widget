import type { ResolverOptions } from 'react-hook-form';

vi.mock('modules/web3', () => ({
  getPrettyChainName: () => 'Base',
  useAA: vi.fn(),
  useDappStatus: vi.fn(),
  useLidoSDKL2: vi.fn(),
}));
vi.mock('@lidofinance/lido-ui', () => ({ ToastError: vi.fn() }));

import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import { L2StakeModule } from 'modules/l2-staking';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import { DefaultValidationErrorTypes } from 'shared/hook-form/validation/validation-error';

import {
  L2StakeFormValidationResolver,
  getL2StakeFormValidationContext,
} from '../validation';
import type {
  L2StakeFormInputType,
  L2StakeFormValidationContext,
  L2StakeFormValidationContextByToken,
} from '../types';

const P = 10n ** 18n;
const LIQUIDITY = 7n * P + 123_456_789n;
const GAS_ETH = 10n ** 15n;
const GAS_WETH = 2n * 10n ** 15n;
const GAS_ETH_SLOW = 4n * 10n ** 15n;
const GAS_WETH_SLOW = 5n * 10n ** 15n;
const CHAIN_ID = 8453;

const context = (
  overrides: Partial<L2StakeFormValidationContext> = {},
): L2StakeFormValidationContext => ({
  isWalletActive: true,
  isSmartAccount: false,
  isFastLaneAvailable: true,
  isSlowLaneAvailable: false,
  gasCostEth: GAS_ETH,
  gasCostWeth: GAS_WETH,
  gasCostEthSlow: GAS_ETH_SLOW,
  gasCostWethSlow: GAS_WETH_SLOW,
  etherBalance: 100n * P,
  wethBalance: 100n * P,
  etherLiquidity: LIQUIDITY,
  shouldValidateEtherBalance: true,
  chainId: CHAIN_ID,
  ...overrides,
});

const byToken = (
  ctx: L2StakeFormValidationContext,
): L2StakeFormValidationContextByToken => ({
  [TOKENS_TO_STAKE.ETH]: Promise.resolve(ctx),
  [TOKENS_TO_STAKE.WETH]: Promise.resolve(ctx),
});

const resolve = (
  amount: bigint | null,
  ctx: L2StakeFormValidationContext = context(),
  token: TOKENS_TO_STAKE = TOKENS_TO_STAKE.ETH,
  contexts: L2StakeFormValidationContextByToken = byToken(ctx),
) =>
  L2StakeFormValidationResolver(
    { amount, token, referral: null },
    contexts,
    {} as ResolverOptions<L2StakeFormInputType>,
  );

type Errors = Record<string, { message?: string; type?: string }>;

const amountError = async (
  amount: bigint | null,
  ctx?: L2StakeFormValidationContext,
  token?: TOKENS_TO_STAKE,
) => {
  const result = await resolve(amount, ctx, token);
  return (result.errors as Errors).amount?.message;
};

const never = new Promise<L2StakeFormValidationContext>(() => undefined);

describe('L2StakeFormValidationResolver', () => {
  describe('ETH', () => {
    it('accepts a stake that exactly exhausts the pool liquidity', async () => {
      const result = await resolve(LIQUIDITY);
      expect(result.errors).toEqual({});
      expect(result.values).toMatchObject({ amount: LIQUIDITY });
    });

    it('rejects a stake one wei above the pool liquidity', async () => {
      await expect(amountError(LIQUIDITY + 1n)).resolves.toMatch(
        /exceeds current staking limit on Base/,
      );
    });

    it('checks liquidity before the balance', async () => {
      const message = await amountError(
        LIQUIDITY + 1n,
        context({ etherBalance: LIQUIDITY }),
      );
      expect(message).toMatch(/staking limit/);
    });

    it('still rejects a stake above the balance within liquidity', async () => {
      const message = await amountError(
        2n * P,
        context({ etherBalance: P, etherLiquidity: 10n * P }),
      );
      expect(message).toMatch(/exceeds your available balance/);
    });

    it('allows nothing to stake when the pool is empty', async () => {
      await expect(
        amountError(1n, context({ etherLiquidity: 0n })),
      ).resolves.toMatch(/staking limit/);
    });

    it('keeps the ETH gas cost in reserve', async () => {
      const message = await amountError(
        P,
        context({ etherBalance: P, etherLiquidity: 10n * P }),
      );
      expect(message).toMatch(/enough ETH for gas/);
    });
  });

  describe('without a wallet', () => {
    const visitor = context({ isWalletActive: false, etherBalance: 0n });

    it('still applies the pool liquidity cap', async () => {
      await expect(amountError(LIQUIDITY + 1n, visitor)).resolves.toMatch(
        /exceeds current staking limit/,
      );
    });

    it('does not check the stubbed balance', async () => {
      const result = await resolve(LIQUIDITY, visitor);
      expect((result.errors as Errors).amount).toBeUndefined();
      expect((result.errors as Errors).referral).toBe('wallet not connected');
    });

    it('skips the liquidity check while the pool is not readable', async () => {
      const result = await resolve(
        LIQUIDITY + 1n,
        context({ ...visitor, etherLiquidity: undefined }),
      );
      expect((result.errors as Errors).amount).toBeUndefined();
    });
  });

  describe('WETH', () => {
    const weth = TOKENS_TO_STAKE.WETH;

    it('validates the amount against the WETH balance', async () => {
      const message = await amountError(
        2n * P,
        context({ wethBalance: P }),
        weth,
      );
      expect(message).toMatch(
        /Entered WETH amount exceeds your available balance/,
      );
    });

    it('lets the whole WETH balance be staked while ETH only covers gas', async () => {
      const result = await resolve(
        3n * P,
        context({ wethBalance: 3n * P, etherBalance: GAS_WETH }),
        weth,
      );
      expect(result.errors).toEqual({});
    });

    it('requires ETH for the approve and stake gas cost', async () => {
      const message = await amountError(
        P,
        context({ etherBalance: GAS_WETH - 1n }),
        weth,
      );
      expect(message).toMatch(/sufficient ETH to cover the gas cost/);
    });

    it('applies the pool liquidity to WETH as well', async () => {
      await expect(
        amountError(LIQUIDITY + 1n, context(), weth),
      ).resolves.toMatch(
        /Entered WETH amount exceeds current staking limit on Base/,
      );
    });

    it('does not require ETH for gas on a smart account', async () => {
      const result = await resolve(
        P,
        context({ etherBalance: 0n, isSmartAccount: true }),
        weth,
      );
      expect(result.errors).toEqual({});
    });
  });

  describe('pool liquidity target', () => {
    const TARGET = 25n * P;
    const withTarget = (
      overrides: Partial<L2StakeFormValidationContext> = {},
    ) => context({ etherLiquidityTarget: TARGET, ...overrides });

    const amountErrorEntry = async (
      amount: bigint,
      ctx: L2StakeFormValidationContext,
      token?: TOKENS_TO_STAKE,
    ) => {
      const result = await resolve(amount, ctx, token);
      return (result.errors as Errors).amount;
    };

    it('accepts a stake within the pool liquidity', async () => {
      const result = await resolve(LIQUIDITY, withTarget());
      expect(result.errors).toEqual({});
    });

    it('raises a soft, message-less error between the liquidity and the target', async () => {
      // the banner, not the field, explains this state; the form must still
      // be invalid
      await expect(
        amountErrorEntry(LIQUIDITY + 1n, withTarget()),
      ).resolves.toEqual(
        expect.objectContaining({
          message: '',
          type: DefaultValidationErrorTypes.VALIDATE,
        }),
      );
    });

    it('keeps the soft error up to the target itself', async () => {
      await expect(
        amountErrorEntry(TARGET, withTarget()),
      ).resolves.toMatchObject({ message: '' });
    });

    it('rejects a stake above the target as exceeding the pool capacity', async () => {
      await expect(
        amountErrorEntry(TARGET + 1n, withTarget()),
      ).resolves.toMatchObject({
        message: expect.stringMatching(/exceeds total pool capacity on Base/),
        type: DefaultValidationErrorTypes.VALIDATE,
      });
    });

    it('caps at the liquidity, not at a stale target below it', async () => {
      const stale = withTarget({ etherLiquidityTarget: LIQUIDITY - P });
      const result = await resolve(LIQUIDITY, stale);
      expect(result.errors).toEqual({});
      await expect(
        amountErrorEntry(LIQUIDITY + 1n, stale),
      ).resolves.toMatchObject({
        message: expect.stringMatching(/exceeds total pool capacity/),
      });
    });

    it('checks the target band before the balance', async () => {
      await expect(
        amountErrorEntry(
          LIQUIDITY + 1n,
          withTarget({ etherBalance: LIQUIDITY }),
        ),
      ).resolves.toMatchObject({ message: '' });
    });

    it('applies the target messaging to WETH as well', async () => {
      const weth = TOKENS_TO_STAKE.WETH;
      await expect(
        amountErrorEntry(LIQUIDITY + 1n, withTarget(), weth),
      ).resolves.toMatchObject({ message: '' });
      await expect(
        amountErrorEntry(TARGET + 1n, withTarget(), weth),
      ).resolves.toMatchObject({
        message: expect.stringMatching(
          /Entered WETH amount exceeds total pool capacity/,
        ),
      });
    });
  });

  describe('per-token context', () => {
    it('validates ETH while the WETH context is still pending', async () => {
      const result = await resolve(P, context(), TOKENS_TO_STAKE.ETH, {
        [TOKENS_TO_STAKE.ETH]: Promise.resolve(context()),
        [TOKENS_TO_STAKE.WETH]: never,
      });
      expect(result.errors).toEqual({});
    });

    it('does not validate WETH until its context resolves', async () => {
      vi.useFakeTimers();
      try {
        const pending = resolve(P, context(), TOKENS_TO_STAKE.WETH, {
          [TOKENS_TO_STAKE.ETH]: Promise.resolve(context()),
          [TOKENS_TO_STAKE.WETH]: never,
        });
        await vi.advanceTimersByTimeAsync(VALIDATION_CONTEXT_TIMEOUT);
        const result = await pending;
        expect((result.errors as Errors).referral?.type).toBe(
          DefaultValidationErrorTypes.UNHANDLED,
        );
      } finally {
        vi.useRealTimers();
      }
    });
  });
});

describe('L2StakeFormValidationResolver lane routing', () => {
  const limits = L2StakeModule.calcSlowStakeLimits(
    {
      tokens: 60n * P,
      lastUpdated: 0,
      isEnabled: true,
      capacity: 90n * P,
      rate: P,
    },
    0n,
  );
  const FRONTED = 25n * 10n ** 15n; // the CCIP cap plus the return budget
  const fetchFee = vi.fn(async () => FRONTED);
  const bothLanes = (overrides: Partial<L2StakeFormValidationContext> = {}) =>
    context({
      isSlowLaneAvailable: true,
      slowStakeLimits: limits,
      fetchSlowStakeFrontedFee: fetchFee,
      ...overrides,
    });

  beforeEach(() => {
    fetchFee.mockClear();
  });

  it('keeps an amount within the pool liquidity on the fast lane, unquoted', async () => {
    const result = await resolve(LIQUIDITY, bothLanes());
    expect(result.errors).toEqual({});
    expect(fetchFee).not.toHaveBeenCalled();
  });

  it('routes an amount above the pool liquidity to the slow lane and quotes it', async () => {
    const result = await resolve(LIQUIDITY + 1n, bothLanes());
    expect(result.errors).toEqual({});
    expect(fetchFee).toHaveBeenCalledWith(LIQUIDITY + 1n);
  });

  it('applies the slow lane cap above the pool liquidity', async () => {
    await expect(amountError(90n * P + 1n, bothLanes())).resolves.toMatch(
      /per-transaction limit/,
    );
  });

  it('keeps the fronted fee in reserve on the slow lane', async () => {
    const balance = 20n * P;
    // fits the balance and the L2 gas, not the fee on top
    const amount = balance - GAS_ETH_SLOW;
    await expect(
      amountError(amount, bothLanes({ etherBalance: balance })),
    ).resolves.toMatch(/leave enough ETH for gas fees/);
    await expect(
      amountError(amount - FRONTED, bothLanes({ etherBalance: balance })),
    ).resolves.toBeUndefined();
  });

  it('does not block the field on a failed quote', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    fetchFee.mockRejectedValueOnce(new Error('rpc down'));
    const result = await resolve(LIQUIDITY + 1n, bothLanes());
    expect(result.errors).toEqual({});
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('keeps everything on the fast lane while the slow lane is closed', async () => {
    await expect(
      amountError(
        LIQUIDITY + 1n,
        context({ fetchSlowStakeFrontedFee: fetchFee }),
      ),
    ).resolves.toMatch(/staking limit/);
    expect(fetchFee).not.toHaveBeenCalled();
  });

  it('sends everything on the slow lane while the fast lane is closed', async () => {
    const result = await resolve(1n, bothLanes({ isFastLaneAvailable: false }));
    expect(result.errors).toEqual({});
    expect(fetchFee).toHaveBeenCalledWith(1n);
  });
});

describe('getL2StakeFormValidationContext', () => {
  const LIQUIDITY_TARGET = 25n * P;
  const deps = {
    isDappActive: true,
    isLiquidityReadable: true,
    areAuxiliaryFundsSupported: false,
    chainId: CHAIN_ID,
    liquidityTargetEth: LIQUIDITY_TARGET,
    isFastLaneAvailable: true,
    isSlowLaneAvailable: false,
    fetchSlowStakeFrontedFee: undefined,
  };
  const loaded = {
    etherBalance: 5n * P,
    wethBalance: 3n * P,
    fastStakeLiquidityEth: LIQUIDITY,
    slowStakeLimits: undefined,
    isSmartAccount: false,
    gasCostEth: GAS_ETH,
    gasCostWeth: GAS_WETH,
    gasCostEthSlow: GAS_ETH_SLOW,
    gasCostWethSlow: GAS_WETH_SLOW,
  };

  it('resolves without the WETH balance', () => {
    const result = getL2StakeFormValidationContext(
      { ...loaded, wethBalance: undefined },
      deps,
    );
    expect(result).toMatchObject({
      isWalletActive: true,
      etherBalance: 5n * P,
      etherLiquidity: LIQUIDITY,
      etherLiquidityTarget: LIQUIDITY_TARGET,
      gasCostEth: GAS_ETH,
      gasCostWeth: GAS_WETH,
      wethBalance: 0n,
      chainId: CHAIN_ID,
      shouldValidateEtherBalance: true,
    });
  });

  it('carries the WETH balance once it is read', () => {
    expect(getL2StakeFormValidationContext(loaded, deps)).toMatchObject({
      wethBalance: 3n * P,
    });
  });

  it.each([
    'etherBalance',
    'fastStakeLiquidityEth',
    'isSmartAccount',
    'gasCostEth',
    'gasCostWeth',
  ] as const)('waits for %s of a connected wallet', (field) => {
    expect(
      getL2StakeFormValidationContext({ ...loaded, [field]: undefined }, deps),
    ).toBeUndefined();
  });

  const noWallet = {
    etherBalance: undefined,
    wethBalance: undefined,
    isSmartAccount: undefined,
    gasCostEth: undefined,
    gasCostWeth: undefined,
  };

  it('resolves with account stubs but the real liquidity when no wallet is connected', () => {
    const result = getL2StakeFormValidationContext(
      { ...noWallet, fastStakeLiquidityEth: LIQUIDITY },
      { ...deps, isDappActive: false },
    );
    expect(result).toMatchObject({
      isWalletActive: false,
      etherBalance: 0n,
      etherLiquidity: LIQUIDITY,
    });
  });

  it('waits for the pool liquidity even without a wallet', () => {
    expect(
      getL2StakeFormValidationContext(
        { ...noWallet, fastStakeLiquidityEth: undefined },
        { ...deps, isDappActive: false },
      ),
    ).toBeUndefined();
  });

  it('resolves without liquidity while the pool is not readable on the SDK chain', () => {
    const result = getL2StakeFormValidationContext(
      { ...noWallet, fastStakeLiquidityEth: undefined },
      { ...deps, isDappActive: false, isLiquidityReadable: false },
    );
    expect(result).toMatchObject({ isWalletActive: false });
    expect(result?.etherLiquidity).toBeUndefined();
  });

  it('skips the ETH balance check when auxiliary funds are supported', () => {
    expect(
      getL2StakeFormValidationContext(loaded, {
        ...deps,
        areAuxiliaryFundsSupported: true,
      }),
    ).toMatchObject({ shouldValidateEtherBalance: false });
  });
});
