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
): AllocationTableData => {
  let result: AllocationTableData | undefined;

  const TestComponent: FC = () => {
    result = useAllocationData(apiData);
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
  });
});
