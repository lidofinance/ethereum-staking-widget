import { parseEther } from 'viem';

import { amountSchema } from './amount';
import { spendChecks, spendMaxAmount } from './spend';

const ONE = parseEther('1');
const ETH = { token: 'eth', chainId: 1 };
const WETH = { token: 'weth', chainId: 1 };
const GAS = parseEther('0.01');

const passes = (check: ReturnType<typeof spendChecks>, amount: bigint) =>
  amountSchema(check).safeParse(amount).success;

describe('smart accounts: no gas checks, full balance', () => {
  it('spends the whole ETH balance', () => {
    const args = {
      tokenIn: ETH,
      balance: ONE,
      etherBalance: ONE,
      gasCost: GAS,
      isSmartAccount: true,
    };
    expect(passes(spendChecks(args), ONE)).toBe(true);
    expect(spendMaxAmount({ ...args, padding: parseEther('0.01') })).toBe(ONE);
  });

  it('stakes WETH holding 0 ETH', () => {
    const args = {
      tokenIn: WETH,
      balance: ONE,
      etherBalance: 0n,
      gasCost: GAS,
      isSmartAccount: true,
    };
    expect(passes(spendChecks(args), ONE)).toBe(true);
  });

  it('still cannot spend more than the balance', () => {
    const args = {
      tokenIn: ETH,
      balance: ONE,
      etherBalance: ONE,
      gasCost: GAS,
      isSmartAccount: true,
    };
    expect(passes(spendChecks(args), ONE + 1n)).toBe(false);
  });
});

describe('EOAs: gas is reserved', () => {
  it('cannot spend the whole ETH balance', () => {
    const args = {
      tokenIn: ETH,
      balance: ONE,
      etherBalance: ONE,
      gasCost: GAS,
      isSmartAccount: false,
    };
    expect(passes(spendChecks(args), ONE)).toBe(false);
    expect(spendMaxAmount({ ...args, padding: parseEther('0.01') })).toBe(
      ONE - GAS - parseEther('0.01'),
    );
  });

  it('cannot stake WETH holding 0 ETH', () => {
    const args = {
      tokenIn: WETH,
      balance: ONE,
      etherBalance: 0n,
      gasCost: GAS,
      isSmartAccount: false,
    };
    expect(passes(spendChecks(args), ONE)).toBe(false);
  });
});
