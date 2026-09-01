import type { FC } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { MetavaultsAllocationFetchedData } from '../apy-data/metavaults-allocation';
import type { AllocationTableData } from '../types';
import { useAllocationData } from './use-allocation-data';

vi.mock(
  'features/earn/shared/vault-allocation/protocol-icon/icon-library',
  () => ({
    getAllocationProtocolIcon: () => () => null,
  }),
);

const consoleWarnSpy = vi
  .spyOn(console, 'warn')
  .mockImplementation(() => undefined);
const consoleDebugSpy = vi
  .spyOn(console, 'debug')
  .mockImplementation(() => undefined);

beforeEach(() => {
  consoleWarnSpy.mockClear();
  consoleDebugSpy.mockClear();
});
afterAll(() => {
  consoleWarnSpy.mockRestore();
  consoleDebugSpy.mockRestore();
});

type ApiAllocation = MetavaultsAllocationFetchedData['allocations'][number];
type ApiNestedAllocation = ApiAllocation['allocations'][number];

const createFlatAllocation = (
  overrides: Partial<ApiAllocation>,
): ApiAllocation => ({
  tvl: {
    asset: '0x0000000000000000000000000000000000000000',
    amount: '100',
    decimals: 0,
    usd: '100',
    usd_decimals: 0,
  },
  type: '',
  id: 'allocation',
  label: 'Allocation',
  sharePercent: 1,
  chain: 'ethereum',
  category: 'protocol',
  protocol: 'aave',
  allocations: [],
  ...overrides,
});

const createData = (
  allocations: ApiAllocation[],
): MetavaultsAllocationFetchedData => ({
  allocations,
  lastUpdate: '1',
  totalTvl: { usd: '100', usd_decimals: 0 },
});

const TEST_LABEL_ALLOWLIST = [
  'allocation',
  'hidden',
  'vault',
  'smaller',
  'larger',
  'small',
  'large',
  'medium',
  ...Array.from({ length: 22 }, (_, index) => `protocol-${index + 1}`),
];

const createNestedAllocation = (
  id: string,
  sharePercent: number,
  overrides: Partial<ApiNestedAllocation> = {},
): ApiNestedAllocation => ({
  id,
  label: id,
  sharePercent,
  chain: 'ethereum',
  category: 'protocol',
  protocol: 'aave',
  ...overrides,
});

const getAllocationData = (
  apiData: MetavaultsAllocationFetchedData,
  labelAllowlist: readonly string[] = TEST_LABEL_ALLOWLIST,
  hiddenAllocationIds: readonly string[] = [],
): AllocationTableData => {
  let result: AllocationTableData | undefined;

  const TestComponent: FC = () => {
    result = useAllocationData(apiData, labelAllowlist, hiddenAllocationIds);
    return null;
  };

  renderToStaticMarkup(<TestComponent />);

  if (!result) throw new Error('Allocation data was not produced');
  return result;
};

describe('useAllocationData grouping and sorting', () => {
  it('ignores inherited properties when resolving subvault tips', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: '__proto__',
          label: 'Vault',
          sharePercent: 100,
          allocations: [
            createNestedAllocation('visible', 100, {
              label: 'Allocation',
            }),
          ],
        }),
      ]),
    );

    expect(result.groups[0]?.info).toBeUndefined();
  });

  it('shows flat Others when its total is below the percent display threshold', () => {
    const result = getAllocationData(
      createData([createFlatAllocation({ id: 'hidden', sharePercent: 0.04 })]),
    );

    expect(result.flatItems).toEqual([
      expect.objectContaining({
        name: 'Others',
        isSummary: true,
        allocation: 0.04,
      }),
    ]);
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'below-min-display-percent',
        id: 'hidden',
      },
    );
  });

  it('keeps all flat summary rows below the percent display threshold', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          id: 'available',
          sharePercent: 0.02,
          category: 'token',
          protocol: undefined,
        }),
        createFlatAllocation({
          id: 'pending',
          sharePercent: 0.03,
          category: 'pending-deposits',
          protocol: undefined,
        }),
        createFlatAllocation({
          id: 'other',
          sharePercent: 0.04,
          category: 'other',
          protocol: undefined,
        }),
      ]),
    );

    expect(
      result.flatItems?.map(({ name, allocation, isSummary }) => ({
        name,
        allocation,
        isSummary,
      })),
    ).toEqual([
      { name: 'Pending', allocation: 0.03, isSummary: true },
      { name: 'Others', allocation: 0.04, isSummary: true },
      { name: 'Available', allocation: 0.02, isSummary: true },
    ]);
  });

  it('rolls nested Others and Available up to the metavault summary rows', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'vault',
          label: 'Vault',
          sharePercent: 1,
          allocations: [
            {
              id: 'hidden',
              label: 'Hidden protocol',
              sharePercent: 0.04,
              chain: 'ethereum',
              category: 'protocol',
              protocol: 'aave',
            },
            {
              id: 'available',
              label: 'Available token',
              sharePercent: 0.02,
              chain: 'ethereum',
              category: 'token',
            },
          ],
        }),
      ]),
    );

    expect(result.groups[0]?.items).toEqual([]);
    expect(result.groups[0]?.allocation).toBeCloseTo(0.9994, 10);
    expect(result.groups[0]?.tvlUSD).toBeCloseTo(99.94, 10);
    expect(result.flatItems).toEqual([
      expect.objectContaining({
        name: 'Others',
        isSummary: true,
        allocation: 0.0004,
        tvlUSD: 0.04,
      }),
      expect.objectContaining({
        name: 'Available',
        isSummary: true,
        allocation: 0.0002,
        tvlUSD: 0.02,
      }),
    ]);
  });

  it('aggregates flat and nested Available allocations into one final row', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          id: 'flat-available',
          sharePercent: 5,
          category: 'token',
          protocol: undefined,
        }),
        createFlatAllocation({
          type: 'nested',
          id: 'smaller-vault',
          label: 'Smaller vault',
          sharePercent: 20,
          allocations: [
            createNestedAllocation('nested-available-1', 10, {
              category: 'token',
              protocol: undefined,
            }),
          ],
        }),
        createFlatAllocation({
          type: 'nested',
          id: 'larger-vault',
          label: 'Larger vault',
          sharePercent: 30,
          allocations: [
            createNestedAllocation('nested-available-2', 20, {
              category: 'token',
              protocol: undefined,
            }),
          ],
        }),
      ]),
    );

    expect(result.groups.every((group) => group.items.length === 0)).toBe(true);
    expect(result.flatItems).toHaveLength(1);
    expect(result.flatItems?.at(-1)).toEqual(
      expect.objectContaining({
        name: 'Available',
        allocation: 13,
        tvlUSD: 130,
      }),
    );
  });

  it('merges nested Pending and Others into the metavault summary rows', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'vault',
          label: 'Vault',
          sharePercent: 20,
          allocations: [
            createNestedAllocation('large', 50),
            createNestedAllocation('pending-child', 30, {
              category: 'pending-deposits',
              protocol: undefined,
            }),
            createNestedAllocation('unknown-position', 20),
          ],
        }),
      ]),
    );

    expect(result.groups[0]?.items).toEqual([
      expect.objectContaining({ label: 'large', allocation: 50, tvlUSD: 50 }),
    ]);
    expect(result.groups[0]).toEqual(
      expect.objectContaining({ allocation: 10, tvlUSD: 50 }),
    );
    expect(result.flatItems).toEqual([
      expect.objectContaining({ name: 'Pending', allocation: 6, tvlUSD: 30 }),
      expect.objectContaining({ name: 'Others', allocation: 4, tvlUSD: 20 }),
    ]);
  });

  it('aggregates flat and nested Pending allocations into one final row', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          id: 'flat-pending',
          sharePercent: 5,
          category: 'pending-deposits',
          protocol: undefined,
        }),
        createFlatAllocation({
          type: 'nested',
          id: 'smaller-vault',
          label: 'Smaller vault',
          sharePercent: 20,
          allocations: [
            createNestedAllocation('nested-pending-1', 10, {
              category: 'pending-deposits',
              protocol: undefined,
            }),
          ],
        }),
        createFlatAllocation({
          type: 'nested',
          id: 'larger-vault',
          label: 'Larger vault',
          sharePercent: 30,
          allocations: [
            createNestedAllocation('nested-pending-2', 20, {
              category: 'pending-deposits',
              protocol: undefined,
            }),
          ],
        }),
      ]),
    );

    expect(result.groups.every((group) => group.items.length === 0)).toBe(true);
    expect(result.flatItems).toEqual([
      expect.objectContaining({
        name: 'Pending',
        allocation: 13,
        tvlUSD: 130,
      }),
    ]);
  });

  it('never emits summary rows inside a subvault', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'vault',
          label: 'Vault',
          sharePercent: 100,
          allocations: [
            createNestedAllocation('large', 40),
            createNestedAllocation('token-child', 20, {
              category: 'token',
              protocol: undefined,
            }),
            createNestedAllocation('pending-child', 20, {
              category: 'pending-deposits',
              protocol: undefined,
            }),
            createNestedAllocation('other-child', 20, {
              category: 'other',
              protocol: undefined,
            }),
          ],
        }),
      ]),
    );

    expect(result.groups[0]?.items.map(({ label }) => label)).toEqual([
      'large',
    ]);
    expect(result.flatItems?.map(({ name }) => name)).toEqual([
      'Pending',
      'Others',
      'Available',
    ]);
  });

  it('drops a fully rolled-up subvault without double counting it', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'vault',
          label: 'Vault',
          sharePercent: 20,
          allocations: [
            createNestedAllocation('pending-child', 100, {
              category: 'pending-deposits',
              protocol: undefined,
            }),
          ],
        }),
      ]),
    );

    expect(result.groups).toEqual([]);
    expect(result.flatItems).toEqual([
      expect.objectContaining({
        name: 'Pending',
        allocation: 20,
        tvlUSD: 100,
      }),
    ]);
    expect(consoleDebugSpy).not.toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'below-min-display-percent',
        id: 'vault',
      },
    );
  });

  it('moves only the share left after roll-up of a below-threshold subvault to Others', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'vault',
          label: 'Vault',
          sharePercent: 0.15,
          allocations: [
            createNestedAllocation('token-child', 50, {
              category: 'token',
              protocol: undefined,
            }),
            createNestedAllocation('large', 50),
          ],
        }),
      ]),
    );

    expect(result.groups).toEqual([]);
    expect(result.flatItems?.map(({ name }) => name)).toEqual([
      'Others',
      'Available',
    ]);
    expect(result.flatItems?.[0]?.allocation).toBeCloseTo(0.075, 12);
    expect(result.flatItems?.[0]?.tvlUSD).toBeCloseTo(50, 12);
    expect(result.flatItems?.[1]?.allocation).toBeCloseTo(0.075, 12);
    expect(result.flatItems?.[1]?.tvlUSD).toBeCloseTo(50, 12);
  });

  it('keeps the displayed shares summing to the total vault share', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({ id: 'large', label: 'Large', sharePercent: 40 }),
        createFlatAllocation({
          type: 'nested',
          id: 'vault',
          label: 'Vault',
          sharePercent: 60,
          allocations: [
            createNestedAllocation('medium', 50),
            createNestedAllocation('pending-child', 30, {
              category: 'pending-deposits',
              protocol: undefined,
            }),
            createNestedAllocation('unknown-position', 20),
          ],
        }),
      ]),
    );

    const total = [...result.groups, ...(result.flatItems ?? [])].reduce(
      (sum, entry) => sum + entry.allocation,
      0,
    );

    expect(total).toBeCloseTo(100, 9);
  });

  it('shows top-level Others produced by an invisible nested group', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'hidden-vault',
          label: 'Hidden vault',
          sharePercent: 0.04,
        }),
      ]),
    );

    expect(result.groups).toEqual([]);
    expect(result.flatItems).toEqual([
      expect.objectContaining({
        name: 'Others',
        isSummary: true,
        allocation: 0.04,
      }),
    ]);
  });

  it('keeps a small Available allocation separate from Others', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({ id: 'hidden-1', sharePercent: 0.04 }),
        createFlatAllocation({ id: 'hidden-2', sharePercent: 0.04 }),
        createFlatAllocation({
          id: 'hidden-token',
          sharePercent: 0.02,
          category: 'token',
          protocol: undefined,
        }),
      ]),
    );

    expect(
      result.flatItems?.map(({ name, allocation }) => ({ name, allocation })),
    ).toEqual([
      { name: 'Others', allocation: 0.08 },
      { name: 'Available', allocation: 0.02 },
    ]);
  });

  it('sorts subvaults and their protocol positions by allocation descending', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'smaller-vault',
          label: 'Smaller vault',
          sharePercent: 20,
        }),
        createFlatAllocation({
          type: 'nested',
          id: 'larger-vault',
          label: 'Larger vault',
          sharePercent: 30,
          allocations: [
            createNestedAllocation('small', 10),
            createNestedAllocation('large', 30),
            createNestedAllocation('medium', 20),
            createNestedAllocation('available', 40, {
              category: 'token',
              protocol: undefined,
            }),
          ],
        }),
      ]),
    );

    expect(result.groups.map(({ name }) => name)).toEqual([
      'Smaller vault',
      'Larger vault',
    ]);
    expect(result.groups[1]?.items.map(({ label }) => label)).toEqual([
      'large',
      'medium',
      'small',
    ]);
    expect(result.groups[1]).toEqual(
      expect.objectContaining({ allocation: 18, tvlUSD: 60 }),
    );
    expect(result.flatItems).toEqual([
      expect.objectContaining({
        name: 'Available',
        allocation: 12,
        tvlUSD: 40,
      }),
    ]);
  });

  it('sorts flat protocols descending and keeps summary rows last', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({ id: 'small', label: 'Small', sharePercent: 10 }),
        createFlatAllocation({ id: 'large', label: 'Large', sharePercent: 30 }),
        createFlatAllocation({
          id: 'available',
          label: 'Available token',
          sharePercent: 40,
          category: 'token',
          protocol: undefined,
        }),
        createFlatAllocation({
          id: 'medium',
          label: 'Medium',
          sharePercent: 20,
        }),
      ]),
    );

    expect(result.flatItems?.map(({ name }) => name)).toEqual([
      'Large',
      'Medium',
      'Small',
      'Available',
    ]);
  });

  it('limits a subvault to 20 protocol rows and moves overflow to Others', () => {
    const allocations = Array.from({ length: 22 }, (_, index) =>
      createNestedAllocation(`protocol-${index + 1}`, index + 1),
    );
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'vault',
          label: 'Vault',
          sharePercent: 100,
          allocations,
        }),
      ]),
    );
    const items = result.groups[0]?.items ?? [];

    expect(items).toHaveLength(20);
    expect(items.map(({ allocation }) => allocation)).toEqual(
      Array.from({ length: 20 }, (_, index) => 22 - index),
    );
    expect(result.groups[0]).toEqual(
      expect.objectContaining({ allocation: 97, tvlUSD: 97 }),
    );
    expect(result.flatItems).toEqual([
      expect.objectContaining({
        name: 'Others',
        isSummary: true,
        allocation: 3,
        tvlUSD: 3,
      }),
    ]);
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'max-subvault-positions',
        id: 'protocol-2',
      },
    );
  });

  it('allows labels when every slash-separated word is allowlisted', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'strategy',
          label: 'Lido stRATEGY',
          sharePercent: 100,
          allocations: [
            createNestedAllocation('valid', 60, {
              label: 'Aave levered wstETH/ETH',
            }),
            createNestedAllocation('invalid', 40, {
              label: 'Aave malicious',
            }),
          ],
        }),
      ]),
      ['lido', 'strategy', 'aave', 'levered', 'wsteth', 'eth'],
    );

    expect(result.groups[0]?.name).toBe('Lido stRATEGY');
    expect(
      result.groups[0]?.items.map(({ label, allocation }) => ({
        label,
        allocation,
      })),
    ).toEqual([{ label: 'Aave levered wstETH/ETH', allocation: 60 }]);
    expect(result.groups[0]).toEqual(
      expect.objectContaining({ allocation: 60, tvlUSD: 60 }),
    );
    expect(result.flatItems).toEqual([
      expect.objectContaining({
        name: 'Others',
        isSummary: true,
        allocation: 40,
        tvlUSD: 40,
      }),
    ]);
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'label-not-allowlisted',
        id: 'invalid',
      },
    );
  });

  it('warns when the label allowlist is empty', () => {
    getAllocationData(
      createData([
        createFlatAllocation({
          id: 'aave',
          label: 'Aave',
          sharePercent: 10,
        }),
      ]),
      [],
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Vault allocation] Label allowlist is empty; API labels will be moved to Others',
    );
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'label-not-allowlisted',
        id: 'aave',
      },
    );
  });

  it('moves a subvault with a non-allowlisted label to top-level Others', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'vault',
          label: 'Unknown Vault',
          sharePercent: 10,
        }),
      ]),
      ['vault'],
    );

    expect(result.groups).toEqual([]);
    expect(
      result.flatItems?.map(({ name, allocation }) => ({
        name,
        allocation,
      })),
    ).toEqual([{ name: 'Others', allocation: 10 }]);
  });

  it('moves a flat allocation with a non-allowlisted label to Others', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          id: 'valid',
          label: 'SparkLend USDC',
          sharePercent: 20,
        }),
        createFlatAllocation({
          id: 'invalid',
          label: 'Injected Label',
          sharePercent: 10,
        }),
      ]),
      ['sparklend', 'usdc'],
    );

    expect(
      result.flatItems?.map(({ name, allocation }) => ({
        name,
        allocation,
      })),
    ).toEqual([
      { name: 'SparkLend USDC', allocation: 20 },
      { name: 'Others', allocation: 10 },
    ]);
  });

  it('moves a hidden flat allocation to Others', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          id: 'hidden-flat',
          label: 'Allocation',
          sharePercent: 20,
        }),
      ]),
      TEST_LABEL_ALLOWLIST,
      ['hidden-flat'],
    );

    expect(result.flatItems).toEqual([
      expect.objectContaining({ name: 'Others', allocation: 20 }),
    ]);
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'hidden-by-config',
        id: 'hidden-flat',
      },
    );
  });

  it('moves a hidden subvault to top-level Others', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'hidden-vault',
          label: 'Vault',
          sharePercent: 30,
        }),
      ]),
      TEST_LABEL_ALLOWLIST,
      ['hidden-vault'],
    );

    expect(result.groups).toEqual([]);
    expect(result.flatItems).toEqual([
      expect.objectContaining({ name: 'Others', allocation: 30 }),
    ]);
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'hidden-by-config',
        id: 'hidden-vault',
      },
    );
  });

  it('moves a hidden nested allocation to the metavault Others row', () => {
    const result = getAllocationData(
      createData([
        createFlatAllocation({
          type: 'nested',
          id: 'vault',
          label: 'Vault',
          sharePercent: 100,
          allocations: [
            createNestedAllocation('visible', 60, { label: 'Allocation' }),
            createNestedAllocation('hidden-nested', 40),
          ],
        }),
      ]),
      TEST_LABEL_ALLOWLIST,
      ['hidden-nested'],
    );

    expect(
      result.groups[0]?.items.map(({ label, allocation }) => ({
        label,
        allocation,
      })),
    ).toEqual([{ label: 'Allocation', allocation: 60 }]);
    expect(result.groups[0]).toEqual(
      expect.objectContaining({ allocation: 60, tvlUSD: 60 }),
    );
    expect(result.flatItems).toEqual([
      expect.objectContaining({
        name: 'Others',
        isSummary: true,
        allocation: 40,
        tvlUSD: 40,
      }),
    ]);
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'hidden-by-config',
        id: 'hidden-nested',
      },
    );
  });
});
