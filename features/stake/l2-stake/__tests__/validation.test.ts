import type { ResolverOptions } from 'react-hook-form';

vi.mock('modules/web3', () => ({
  getPrettyChainName: () => 'Base',
  useAA: vi.fn(),
  useDappStatus: vi.fn(),
}));

import { L2StakeFormValidationResolver } from '../validation';
import type {
  L2StakeFormInputType,
  L2StakeFormValidationContext,
} from '../types';

const P = 10n ** 18n;
const LIQUIDITY = 7n * P + 123_456_789n;

const context = (
  overrides: Partial<L2StakeFormValidationContext> = {},
): L2StakeFormValidationContext => ({
  isWalletActive: true,
  isSmartAccount: false,
  gasCost: 0n,
  etherBalance: 100n * P,
  etherLiquidity: LIQUIDITY,
  shouldValidateEtherBalance: true,
  chainId: 8453,
  ...overrides,
});

const resolve = (
  amount: bigint | null,
  ctx: L2StakeFormValidationContext = context(),
) =>
  L2StakeFormValidationResolver(
    { amount, referral: null },
    Promise.resolve(ctx),
    {} as ResolverOptions<L2StakeFormInputType>,
  );

const amountError = async (
  amount: bigint | null,
  ctx?: L2StakeFormValidationContext,
) => {
  const result = await resolve(amount, ctx);
  const errors = result.errors as Record<string, { message?: string }>;
  return errors.amount?.message;
};

describe('L2StakeFormValidationResolver', () => {
  it('accepts a stake that exactly exhausts the pool liquidity', async () => {
    await expect(resolve(LIQUIDITY)).resolves.toMatchObject({ errors: {} });
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
    expect(message).toBeDefined();
    expect(message).not.toMatch(/staking limit/);
  });

  it('allows nothing to stake when the pool is empty', async () => {
    await expect(
      amountError(1n, context({ etherLiquidity: 0n })),
    ).resolves.toMatch(/staking limit/);
  });
});
