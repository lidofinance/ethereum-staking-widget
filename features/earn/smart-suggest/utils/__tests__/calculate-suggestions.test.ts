import { parseEther, parseUnits } from 'viem';

import {
  calculateSuggestions,
  type CalculateSuggestionsArgs,
} from '../calculate-suggestions';

// $3,000 per ETH with 8 decimals, like the Chainlink feed
const ETH_USD_PRICE = { latestAnswer: 3000_00000000n, decimals: 8n };

const VAULTS_ENABLED: CalculateSuggestionsArgs['vaults'] = {
  eth: { apy: 7, isDepositEnabled: true },
  usd: { apy: 6.4, isDepositEnabled: true },
};

const usdc = (amount: string) => parseUnits(amount, 6);

const getArgs = (
  overrides: Partial<CalculateSuggestionsArgs> = {},
): CalculateSuggestionsArgs => ({
  balances: {},
  ethUsdPrice: ETH_USD_PRICE,
  stethPerWsteth: parseEther('1.2'),
  vaults: VAULTS_ENABLED,
  ...overrides,
});

describe('calculateSuggestions', () => {
  it('returns no rows for an empty wallet', () => {
    expect(calculateSuggestions(getArgs())).toEqual({ rows: [], totalUsd: 0 });
  });

  it('calculates the yearly yield of a token', () => {
    const { rows, totalUsd } = calculateSuggestions(
      getArgs({ balances: { eth: parseEther('10.0231') } }),
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      token: 'eth',
      vault: 'eth',
      apy: 7,
      yearlyYield: parseEther('0.701617'),
      yieldToken: 'eth',
    });
    // 10.0231 ETH * $3,000 * 7%
    expect(totalUsd).toBeCloseTo(2104.851, 6);
  });

  it('applies the $100 threshold to each token separately', () => {
    const { rows } = calculateSuggestions(
      getArgs({
        balances: {
          // $90
          eth: parseEther('0.03'),
          // $99.99
          usdc: usdc('99.99'),
          // exactly $100
          usdt: usdc('100'),
        },
      }),
    );

    expect(rows.map((row) => row.token)).toEqual(['usdt']);
  });

  it('converts wstETH to ETH with the wrap rate', () => {
    const { rows, totalUsd } = calculateSuggestions(
      getArgs({ balances: { wsteth: parseEther('1') } }),
    );

    expect(rows[0]).toMatchObject({
      token: 'wsteth',
      balance: parseEther('1'),
      // 1.2 ETH * 7%
      yearlyYield: parseEther('0.084'),
      yieldToken: 'eth',
    });
    // 1.2 ETH * $3,000 * 7%
    expect(totalUsd).toBeCloseTo(252, 6);
  });

  it('uses the wrap rate for the wstETH threshold', () => {
    const { rows } = calculateSuggestions(
      getArgs({
        // 0.03 wstETH = 0.036 ETH = $108
        balances: { wsteth: parseEther('0.03') },
      }),
    );

    expect(rows.map((row) => row.token)).toEqual(['wsteth']);
  });

  it('skips wstETH without the wrap rate', () => {
    const { rows } = calculateSuggestions(
      getArgs({
        balances: { eth: parseEther('1'), wsteth: parseEther('1') },
        stethPerWsteth: undefined,
      }),
    );

    expect(rows.map((row) => row.token)).toEqual(['eth']);
  });

  it('skips ETH vault tokens without the ETH price', () => {
    const { rows } = calculateSuggestions(
      getArgs({
        balances: { eth: parseEther('1'), usdc: usdc('500') },
        ethUsdPrice: undefined,
      }),
    );

    expect(rows.map((row) => row.token)).toEqual(['usdc']);
  });

  it('keeps stablecoin yield in the same token', () => {
    const { rows, totalUsd } = calculateSuggestions(
      getArgs({
        balances: { usdc: usdc('5000'), usde: parseEther('4000') },
      }),
    );

    expect(rows).toMatchObject([
      {
        token: 'usdc',
        vault: 'usd',
        yearlyYield: usdc('320'),
        yieldToken: 'usdc',
        yieldDecimals: 6,
      },
      {
        token: 'usde',
        vault: 'usd',
        yearlyYield: parseEther('256'),
        yieldToken: 'usde',
        yieldDecimals: 18,
      },
    ]);
    expect(totalUsd).toBeCloseTo(576, 6);
  });

  it.each([
    ['deposits are disabled', { apy: 7, isDepositEnabled: false }],
    ['APY is not loaded', { apy: undefined, isDepositEnabled: true }],
    ['APY is zero', { apy: 0, isDepositEnabled: true }],
  ])('skips the vault tokens when %s', (_, ethVault) => {
    const { rows } = calculateSuggestions(
      getArgs({
        balances: { eth: parseEther('1'), usdc: usdc('500') },
        vaults: { ...VAULTS_ENABLED, eth: ethVault },
      }),
    );

    expect(rows.map((row) => row.token)).toEqual(['usdc']);
  });

  it('returns rows in a fixed order and sums the total', () => {
    const { rows, totalUsd } = calculateSuggestions(
      getArgs({
        balances: {
          usde: parseEther('100'),
          usdt: usdc('100'),
          usdc: usdc('100'),
          wsteth: parseEther('1'),
          steth: parseEther('1'),
          weth: parseEther('1'),
          eth: parseEther('1'),
        },
      }),
    );

    expect(rows.map((row) => row.token)).toEqual([
      'eth',
      'weth',
      'steth',
      'wsteth',
      'usdc',
      'usdt',
      'usde',
    ]);
    // ETH vault: (1 + 1 + 1 + 1.2) ETH * $3,000 * 7% = $882
    // USD vault: $300 * 6.4% = $19.2
    expect(totalUsd).toBeCloseTo(901.2, 6);
  });
});
