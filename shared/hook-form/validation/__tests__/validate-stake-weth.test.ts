import { parseEther } from 'viem';

import { LIMIT_LEVEL } from 'types';
import { validateStakeWeth } from '../validate-stake-weth';

const base = {
  formField: 'amount',
  amount: parseEther('1'),
  stakingLimitLevel: LIMIT_LEVEL.SAFE,
  currentStakeLimit: parseEther('100'),
  gasCost: parseEther('0.01'),
};

const active = {
  ...base,
  isWalletActive: true as const,
  wethBalance: parseEther('2'),
  etherBalance: parseEther('0.05'),
  isSmartAccount: false,
};

describe('validateStakeWeth', () => {
  it('passes for a WETH amount covered by balance, limit and ETH for gas', () => {
    expect(() => validateStakeWeth(active)).not.toThrow();
  });

  it('rejects when the stake limit is reached, even without a wallet', () => {
    expect(() =>
      validateStakeWeth({
        ...base,
        isWalletActive: false,
        stakingLimitLevel: LIMIT_LEVEL.REACHED,
      }),
    ).toThrow(/Staking limit reached/);
  });

  it('skips balance checks without an active wallet', () => {
    expect(() =>
      validateStakeWeth({ ...base, isWalletActive: false }),
    ).not.toThrow();
  });

  it('rejects an amount above the current stake limit', () => {
    expect(() =>
      validateStakeWeth({ ...active, currentStakeLimit: parseEther('0.5') }),
    ).toThrow(/exceeds current staking limit/);
  });

  it('rejects an amount above the WETH balance', () => {
    expect(() =>
      validateStakeWeth({ ...active, wethBalance: parseEther('0.5') }),
    ).toThrow(/exceeds your available balance/);
  });

  it('allows staking the whole WETH balance (gas is paid in ETH)', () => {
    expect(() =>
      validateStakeWeth({ ...active, amount: active.wethBalance }),
    ).not.toThrow();
  });

  it('rejects when the ETH balance does not cover gas', () => {
    expect(() =>
      validateStakeWeth({ ...active, etherBalance: parseEther('0.001') }),
    ).toThrow(/sufficient ETH to cover the gas cost/);
  });

  it('lets a smart account stake without ETH for gas', () => {
    expect(() =>
      validateStakeWeth({ ...active, etherBalance: 0n, isSmartAccount: true }),
    ).not.toThrow();
  });
});
