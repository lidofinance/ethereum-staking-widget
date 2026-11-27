import { METAVAULTS_ALLOCATION_DATA_SCHEMA } from './metavaults-allocation';

const createValidData = () => ({
  allocations: [
    {
      tvl: {
        asset: '0x0000000000000000000000000000000000000000',
        amount: '1000000000000000000',
        decimals: 18,
        usd: '10000',
        usd_decimals: 2,
      },
      id: 'allocation',
      label: 'Allocation',
      sharePercent: 100,
      chain: 'ethereum',
      category: 'protocol',
      protocol: 'aave',
    },
  ],
  lastUpdate: '1',
  totalTvl: {
    usd: '10000',
    usd_decimals: 2,
  },
});

describe('METAVAULTS_ALLOCATION_DATA_SCHEMA numeric values', () => {
  it('accepts unsigned integer strings and bounded decimals', () => {
    expect(
      METAVAULTS_ALLOCATION_DATA_SCHEMA.safeParse(createValidData()).success,
    ).toBe(true);
  });

  it.each(['1.5', 'abc', '1e10', '-1', ''])(
    'rejects numeric string %j',
    (value) => {
      const allocationAmountData = createValidData();
      allocationAmountData.allocations[0].tvl.amount = value;
      expect(
        METAVAULTS_ALLOCATION_DATA_SCHEMA.safeParse(allocationAmountData)
          .success,
      ).toBe(false);

      const allocationUsdData = createValidData();
      allocationUsdData.allocations[0].tvl.usd = value;
      expect(
        METAVAULTS_ALLOCATION_DATA_SCHEMA.safeParse(allocationUsdData).success,
      ).toBe(false);

      const totalTvlData = createValidData();
      totalTvlData.totalTvl.usd = value;
      expect(
        METAVAULTS_ALLOCATION_DATA_SCHEMA.safeParse(totalTvlData).success,
      ).toBe(false);
    },
  );

  it.each([-1, 1.5, 256, 1_000_000_000])(
    'rejects decimals value %j',
    (value) => {
      const allocationDecimalsData = createValidData();
      allocationDecimalsData.allocations[0].tvl.decimals = value;
      expect(
        METAVAULTS_ALLOCATION_DATA_SCHEMA.safeParse(allocationDecimalsData)
          .success,
      ).toBe(false);

      const allocationUsdDecimalsData = createValidData();
      allocationUsdDecimalsData.allocations[0].tvl.usd_decimals = value;
      expect(
        METAVAULTS_ALLOCATION_DATA_SCHEMA.safeParse(allocationUsdDecimalsData)
          .success,
      ).toBe(false);

      const totalTvlData = createValidData();
      totalTvlData.totalTvl.usd_decimals = value;
      expect(
        METAVAULTS_ALLOCATION_DATA_SCHEMA.safeParse(totalTvlData).success,
      ).toBe(false);
    },
  );
});
