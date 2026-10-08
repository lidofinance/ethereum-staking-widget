import {
  calcFastStakeEthByWsteth,
  calcFastStakeWstethByEth,
} from 'modules/l2-staking/l2-staking-module';

const P = 10n ** 18n;
const FEE = 10n ** 15n;
const PRICE = 12n * 10n ** 17n;

const useQueryMock = vi.hoisted(() => vi.fn());
vi.mock('@tanstack/react-query', () => ({ useQuery: useQueryMock }));
vi.mock('modules/web3', () => ({
  useLidoSDKL2: () => ({
    chainId: 8453,
    isL2Stake: true,
    l2Stake: {
      fetchFastStakeRate: async () => ({ feeRate: FEE, price: PRICE }),
    },
  }),
}));

import { useFastStakeConversion } from '../hooks/use-conversion';

type Conversion = {
  feeRate: bigint;
  price: bigint;
  ethToWsteth: (amount: bigint, options?: { includeFee?: boolean }) => bigint;
  wstethToEth: (amount: bigint, options?: { includeFee?: boolean }) => bigint;
};

// Reads the conversion the hook handed to React Query
const conversionFromQuery = (): Promise<Conversion> => {
  const [{ queryFn }] = useQueryMock.mock.calls[0] as [
    { queryFn: () => Promise<Conversion> },
  ];
  return queryFn();
};

beforeEach(() => {
  useQueryMock.mockReset();
});

describe('useFastStakeConversion', () => {
  it('exposes the live rate', async () => {
    useFastStakeConversion();
    const conversion = await conversionFromQuery();
    expect(conversion).toMatchObject({ feeRate: FEE, price: PRICE });
  });

  it('charges the pool fee by default', async () => {
    useFastStakeConversion();
    const conversion = await conversionFromQuery();
    expect(conversion.ethToWsteth(P)).toBe(
      calcFastStakeWstethByEth(P, FEE, PRICE),
    );
    expect(conversion.wstethToEth(P)).toBe(
      calcFastStakeEthByWsteth(P, FEE, PRICE),
    );
  });

  it('values a balance at the bare oracle price without the fee', async () => {
    useFastStakeConversion();
    const conversion = await conversionFromQuery();
    expect(conversion.ethToWsteth(P, { includeFee: false })).toBe(
      calcFastStakeWstethByEth(P, 0n, PRICE),
    );
    expect(conversion.wstethToEth(P, { includeFee: false })).toBe(
      calcFastStakeEthByWsteth(P, 0n, PRICE),
    );
    expect(conversion.wstethToEth(P, { includeFee: false })).toBeLessThan(
      conversion.wstethToEth(P),
    );
  });
});
