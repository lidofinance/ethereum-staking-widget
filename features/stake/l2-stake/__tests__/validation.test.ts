import type { ResolverOptions } from 'react-hook-form';

vi.mock('modules/web3', () => ({
  getPrettyChainName: () => 'Base',
  useAA: vi.fn(),
  useDappStatus: vi.fn(),
  useLidoSDKL2: vi.fn(),
}));
vi.mock('@lidofinance/lido-ui', () => ({ ToastError: vi.fn() }));

import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
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
const CHAIN_ID = 8453;

const context = (
  overrides: Partial<L2StakeFormValidationContext> = {},
): L2StakeFormValidationContext => ({
  isWalletActive: true,
  isSmartAccount: false,
  gasCostEth: GAS_ETH,
  gasCostWeth: GAS_WETH,
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

describe('getL2StakeFormValidationContext', () => {
  const deps = {
    isDappActive: true,
    isLiquidityReadable: true,
    areAuxiliaryFundsSupported: false,
    chainId: CHAIN_ID,
  };
  const loaded = {
    etherBalance: 5n * P,
    wethBalance: 3n * P,
    fastStakeLiquidityEth: LIQUIDITY,
    isSmartAccount: false,
    gasCostEth: GAS_ETH,
    gasCostWeth: GAS_WETH,
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
