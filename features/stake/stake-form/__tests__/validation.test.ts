import type { ResolverOptions } from 'react-hook-form';

import { LIMIT_LEVEL } from 'types';

vi.mock('modules/web3', () => ({
  useAA: vi.fn(),
  useDappStatus: vi.fn(),
}));
vi.mock('@lidofinance/lido-ui', () => ({ ToastError: vi.fn() }));

import { VALIDATION_CONTEXT_TIMEOUT } from 'features/withdrawals/withdrawals-constants';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import { DefaultValidationErrorTypes } from 'shared/hook-form/validation/validation-error';
import type { StakeLimitFullInfo } from 'shared/hooks/useStakingLimitInfo';

import {
  stakeFormValidationResolver,
  getStakeFormValidationContext,
} from '../stake-form-context/validation';
import type {
  StakeFormInput,
  StakeFormValidationContext,
  StakeFormValidationContextByToken,
} from '../stake-form-context/types';

const P = 10n ** 18n;
const STAKE_LIMIT = 50n * P;
const GAS_ETH = 10n ** 15n;
const GAS_WETH = 2n * 10n ** 15n;

const context = (
  overrides: Partial<StakeFormValidationContext> = {},
): StakeFormValidationContext => ({
  isWalletActive: true,
  isSmartAccount: false,
  stakingLimitLevel: LIMIT_LEVEL.SAFE,
  currentStakeLimit: STAKE_LIMIT,
  gasCostEth: GAS_ETH,
  gasCostWeth: GAS_WETH,
  etherBalance: 100n * P,
  wethBalance: 100n * P,
  shouldValidateEtherBalance: true,
  ...overrides,
});

const byToken = (
  ctx: StakeFormValidationContext,
): StakeFormValidationContextByToken => ({
  [TOKENS_TO_STAKE.ETH]: Promise.resolve(ctx),
  [TOKENS_TO_STAKE.WETH]: Promise.resolve(ctx),
});

const resolve = (
  amount: bigint | null,
  ctx: StakeFormValidationContext = context(),
  token: TOKENS_TO_STAKE = TOKENS_TO_STAKE.ETH,
  contexts: StakeFormValidationContextByToken = byToken(ctx),
) =>
  stakeFormValidationResolver(
    { amount, token, referral: null },
    contexts,
    {} as ResolverOptions<StakeFormInput>,
  );

type Errors = Record<string, { message?: string; type?: string }>;

const amountError = async (
  amount: bigint | null,
  ctx?: StakeFormValidationContext,
  token?: TOKENS_TO_STAKE,
) => {
  const result = await resolve(amount, ctx, token);
  return (result.errors as Errors).amount?.message;
};

const never = new Promise<StakeFormValidationContext>(() => undefined);

describe('stakeFormValidationResolver', () => {
  describe('ETH', () => {
    it('accepts a stake within the balance and the limit', async () => {
      const result = await resolve(P);
      expect(result.errors).toEqual({});
    });

    it('rejects a stake above the staking limit', async () => {
      await expect(amountError(STAKE_LIMIT + 1n)).resolves.toMatch(
        /Entered ETH amount exceeds current staking limit/,
      );
    });

    it('rejects a stake above the balance', async () => {
      await expect(
        amountError(2n * P, context({ etherBalance: P })),
      ).resolves.toMatch(/exceeds your available balance/);
    });

    it('rejects everything when the limit is reached', async () => {
      await expect(
        amountError(1n, context({ stakingLimitLevel: LIMIT_LEVEL.REACHED })),
      ).resolves.toMatch(/Staking limit reached/);
    });
  });

  describe('WETH', () => {
    const weth = TOKENS_TO_STAKE.WETH;

    it('validates the amount against the WETH balance', async () => {
      await expect(
        amountError(2n * P, context({ wethBalance: P }), weth),
      ).resolves.toMatch(/Entered WETH amount exceeds your available balance/);
    });

    it('lets the whole WETH balance be staked while ETH only covers gas', async () => {
      const result = await resolve(
        3n * P,
        context({ wethBalance: 3n * P, etherBalance: GAS_WETH }),
        weth,
      );
      expect(result.errors).toEqual({});
    });

    it('requires ETH for the unwrap and submit gas cost', async () => {
      await expect(
        amountError(P, context({ etherBalance: GAS_WETH - 1n }), weth),
      ).resolves.toMatch(/sufficient ETH to cover the gas cost/);
    });

    it('applies the staking limit to WETH as well', async () => {
      await expect(
        amountError(STAKE_LIMIT + 1n, context(), weth),
      ).resolves.toMatch(/Entered WETH amount exceeds current staking limit/);
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

describe('getStakeFormValidationContext', () => {
  const stakingLimitInfo = {
    stakeLimitLevel: LIMIT_LEVEL.SAFE,
    currentStakeLimit: STAKE_LIMIT,
  } as StakeLimitFullInfo;
  const deps = { isDappActive: true, areAuxiliaryFundsSupported: false };
  const loaded = {
    stakingLimitInfo,
    etherBalance: 5n * P,
    wethBalance: 3n * P,
    isSmartAccount: false,
    gasCostEth: GAS_ETH,
    gasCostWeth: GAS_WETH,
  };

  it('resolves without the WETH balance', () => {
    expect(
      getStakeFormValidationContext(
        { ...loaded, wethBalance: undefined },
        deps,
      ),
    ).toMatchObject({
      isWalletActive: true,
      stakingLimitLevel: LIMIT_LEVEL.SAFE,
      currentStakeLimit: STAKE_LIMIT,
      etherBalance: 5n * P,
      gasCostEth: GAS_ETH,
      gasCostWeth: GAS_WETH,
      wethBalance: 0n,
    });
  });

  it('carries the WETH balance once it is read', () => {
    expect(getStakeFormValidationContext(loaded, deps)).toMatchObject({
      wethBalance: 3n * P,
    });
  });

  it.each([
    'stakingLimitInfo',
    'etherBalance',
    'isSmartAccount',
    'gasCostEth',
    'gasCostWeth',
  ] as const)('waits for %s of a connected wallet', (field) => {
    expect(
      getStakeFormValidationContext({ ...loaded, [field]: undefined }, deps),
    ).toBeUndefined();
  });

  it('only needs the staking limit when no wallet is connected', () => {
    const result = getStakeFormValidationContext(
      {
        stakingLimitInfo,
        etherBalance: undefined,
        wethBalance: undefined,
        isSmartAccount: undefined,
        gasCostEth: undefined,
        gasCostWeth: undefined,
      },
      { ...deps, isDappActive: false },
    );
    expect(result).toMatchObject({ isWalletActive: false, etherBalance: 0n });
  });
});
