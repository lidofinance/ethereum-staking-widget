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

beforeEach(() => consoleWarnSpy.mockClear());
afterAll(() => consoleWarnSpy.mockRestore());

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
  it('hides flat Others when its total is below the display threshold', () => {
    const result = getAllocationData(
      createData([createFlatAllocation({ id: 'hidden', sharePercent: 0.04 })]),
    );

    expect(result.flatItems).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'below-min-display-percent',
        id: 'hidden',
      },
    );
  });

  it('hides nested Others when its total is below the display threshold', () => {
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
  });

  it('hides top-level Others produced by an invisible nested group', () => {
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
    expect(result.flatItems).toBeUndefined();
  });

  it('shows Others when accumulated invisible allocations reach the threshold', () => {
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

    expect(result.flatItems).toHaveLength(1);
    expect(result.flatItems?.[0]?.name).toBe('Others');
    expect(result.flatItems?.[0]?.allocation).toBeCloseTo(0.1);
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
      'Larger vault',
      'Smaller vault',
    ]);
    expect(result.groups[0]?.items.map(({ label }) => label)).toEqual([
      'large',
      'medium',
      'small',
      'Available',
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

    expect(items).toHaveLength(21);
    expect(items.slice(0, 20).map(({ allocation }) => allocation)).toEqual(
      Array.from({ length: 20 }, (_, index) => 22 - index),
    );
    expect(items[20]?.label).toBe('Others');
    expect(items[20]?.allocation).toBe(3);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
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
    ).toEqual([
      { label: 'Aave levered wstETH/ETH', allocation: 60 },
      { label: 'Others', allocation: 40 },
    ]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
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
    expect(consoleWarnSpy).toHaveBeenCalledWith(
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
    expect(consoleWarnSpy).toHaveBeenCalledWith(
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
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'hidden-by-config',
        id: 'hidden-vault',
      },
    );
  });

  it('moves a hidden nested allocation to the subvault Others row', () => {
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
    ).toEqual([
      { label: 'Allocation', allocation: 60 },
      { label: 'Others', allocation: 40 },
    ]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Vault allocation] Allocation moved to Others',
      {
        reason: 'hidden-by-config',
        id: 'hidden-nested',
      },
    );
  });
});
