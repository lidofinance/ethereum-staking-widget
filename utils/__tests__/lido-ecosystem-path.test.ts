import { describe, it, expect, vi } from 'vitest';

vi.mock('config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('config')>();
  return { ...actual, config: { rootOrigin: 'https://lido.fi' } };
});

import { CHAINS } from 'config';
import { lidoEcosystemPath } from '../lido-ecosystem-path';

const BASE = 'https://lido.fi/lido-ecosystem';

describe('lidoEcosystemPath', () => {
  it('returns bare path for no args', () => {
    expect(lidoEcosystemPath()).toBe(BASE);
    expect(lidoEcosystemPath({})).toBe(BASE);
  });

  it('omits empty arrays', () => {
    expect(
      lidoEcosystemPath({ tokens: [], chainIds: [], categories: [] }),
    ).toBe(BASE);
  });

  it('lowercases tokens and categories like the ecosystem page does', () => {
    expect(lidoEcosystemPath({ tokens: ['stETH'], categories: ['Get'] })).toBe(
      `${BASE}?tokens=steth&categories=get`,
    );
  });

  it('maps chain ids to network labels, encoding space as + and comma as %2C', () => {
    expect(
      lidoEcosystemPath({ chainIds: [CHAINS.Arbitrum, CHAINS.Optimism] }),
    ).toBe(`${BASE}?networks=arbitrum%2Cop+mainnet`);
    expect(
      lidoEcosystemPath({ chainIds: [CHAINS.Mainnet, CHAINS.Unichain] }),
    ).toBe(`${BASE}?networks=ethereum%2Cunichain`);
  });

  it('round-trips through the page parser (split on comma, case-insensitive)', () => {
    const url = new URL(
      lidoEcosystemPath({
        chainIds: [CHAINS.Optimism, CHAINS.Base],
        tokens: ['wstETH', 'LDO'],
      }),
    );
    expect(url.searchParams.get('networks')?.split(',')).toEqual([
      'op mainnet',
      'base',
    ]);
    expect(url.searchParams.get('tokens')?.split(',')).toEqual([
      'wsteth',
      'ldo',
    ]);
  });

  it('skips chains without a known label and omits networks when none remain', () => {
    expect(
      lidoEcosystemPath({ chainIds: [CHAINS.Hoodi, CHAINS.Base, 56] }),
    ).toBe(`${BASE}?networks=base`);
    expect(lidoEcosystemPath({ chainIds: [CHAINS.Hoodi] })).toBe(BASE);
  });

  it('builds the full filter set in page order', () => {
    expect(
      lidoEcosystemPath({
        chainIds: [
          CHAINS.Arbitrum,
          CHAINS.Mainnet,
          CHAINS.Optimism,
          CHAINS.Base,
          CHAINS.Linea,
          CHAINS.Unichain,
        ],
        tokens: ['wstETH', 'LDO', 'stETH'],
        categories: ['Analyze', 'Hold', 'Earn', 'Get', 'Cover'],
        criteria: 'and',
      }),
    ).toBe(
      `${BASE}?networks=arbitrum%2Cethereum%2Cop+mainnet%2Cbase%2Clinea%2Cunichain&tokens=wsteth%2Cldo%2Csteth&categories=analyze%2Chold%2Cearn%2Cget%2Ccover&criteria=and`,
    );
  });
});
