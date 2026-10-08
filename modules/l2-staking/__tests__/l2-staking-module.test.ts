import {
  decodeFunctionData,
  encodeFunctionData,
  getAddress,
  zeroAddress,
  type Address,
  type Hash,
} from 'viem';
import {
  CHAINS,
  ERROR_CODE,
  LIDO_L2_CONTRACT_ADDRESSES,
} from '@lidofinance/lido-ethereum-sdk/common';
import type { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';

import { L2_STAKING_RECEIVER_ABI } from '../l2-staking-abi';
import {
  L2StakeModule,
  calcFastStakeEthByWsteth,
  calcFastStakeWstethByEth,
} from '../l2-staking-module';

const P = 10n ** 18n;
const FEE = 10n ** 15n; // 0.1%
const PRICE = 12n * 10n ** 17n; // 1 wstETH = 1.2 ETH
const LIQUIDITY = 7n * 10n ** 18n + 123_456_789n; // pool wstETH balance

const ACCOUNT: Address = '0x00000000000000000000000000000000000000aa';
const REFERRAL: Address = '0x00000000000000000000000000000000000000bb';
const POOL: Address = '0x00000000000000000000000000000000000000cc';
const FEED: Address = '0x00000000000000000000000000000000000000dd';
const WETH: Address = '0x00000000000000000000000000000000000000ee';
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';

const l2Addresses = (chainId: CHAINS) => {
  const addresses = LIDO_L2_CONTRACT_ADDRESSES[chainId];
  if (!addresses?.wsteth || !addresses.stakeReceiver)
    throw new Error(`no L2 staking addresses for ${chainId}`);
  return { wsteth: addresses.wsteth, stakeReceiver: addresses.stakeReceiver };
};

type ReadCall = { address: Address; functionName: string; args?: unknown[] };

// The module only needs `core` for its clients, account and chain: a plain
// stub keeps real viem encoding in the loop while the RPC is a lookup table
const createModule = (chainId: CHAINS = CHAINS.Base) => {
  const reads: Record<string, unknown> = {
    getOraclePool: POOL,
    getOracle: FEED,
    getFee: FEE,
    getLatestAnswer: PRICE,
    TOKEN: LIDO_L2_CONTRACT_ADDRESSES[chainId]?.wsteth,
    WNATIVE: WETH,
    MIN_PROCESS_MESSAGE_GAS: 200_000,
    LINK_TOKEN: '0x00000000000000000000000000000000000000f1',
    CCIP_ROUTER: '0x00000000000000000000000000000000000000f2',
    balanceOf: LIQUIDITY,
  };
  const publicClient = {
    readContract: vi.fn(async ({ functionName }: ReadCall) => {
      if (!(functionName in reads))
        throw new Error(`unexpected read: ${functionName}`);
      return reads[functionName];
    }),
    estimateContractGas: vi.fn(async () => 120_000n),
  };
  const walletClient = { writeContract: vi.fn(async () => TX_HASH) };
  const core = {
    chain: { id: chainId },
    chainId,
    logMode: 'none',
    keyedClient: { public: publicClient, wallet: walletClient },
    useAccount: vi.fn(async (account?: Address) => ({
      address: account ?? ACCOUNT,
      type: 'json-rpc',
    })),
    useWalletClient: vi.fn(() => walletClient),
    // Mirrors the SDK: estimate, then send with the estimated gas
    performTransaction: vi.fn(
      async (props: {
        account: { address: Address };
        getGasLimit: (options: object) => Promise<bigint>;
        sendTransaction: (options: object) => Promise<Hash>;
      }) => {
        const gas = await props.getGasLimit({ account: props.account });
        const hash = await props.sendTransaction({
          account: props.account,
          gas,
        });
        return { hash };
      },
    ),
  };
  const l2Stake = new L2StakeModule({ core: core as unknown as LidoSDKCore });
  return { l2Stake, core, publicClient, walletClient };
};

const decodeFastStake = (data?: Hash) => {
  if (!data) throw new Error('populated tx has no calldata');
  const decoded = decodeFunctionData({ abi: L2_STAKING_RECEIVER_ABI, data });
  expect(decoded.functionName).toBe('fastStakeReferral');
  return decoded.args as readonly [Address, bigint, bigint, Address];
};

describe('calcFastStakeWstethByEth', () => {
  it('takes the fee from the ETH and prices the remainder', () => {
    // (1 - 0.001) / 1.2
    expect(calcFastStakeWstethByEth(P, FEE, PRICE)).toBe(
      832_500_000_000_000_000n,
    );
  });

  it('rounds down', () => {
    expect(calcFastStakeWstethByEth(P, 0n, PRICE)).toBe(
      833_333_333_333_333_333n,
    );
    expect(calcFastStakeWstethByEth(1n, 0n, PRICE)).toBe(0n);
  });

  it('is identity at par without a fee', () => {
    expect(calcFastStakeWstethByEth(P, 0n, P)).toBe(P);
  });
});

describe('calcFastStakeEthByWsteth', () => {
  const samples = [
    0n,
    1n,
    7n,
    999_999n,
    P,
    LIQUIDITY,
    123_456_789_012_345_678_901n,
  ];
  const rates = [
    { feeRate: FEE, price: PRICE },
    { feeRate: 0n, price: PRICE },
    { feeRate: 0n, price: P },
    { feeRate: 5n * 10n ** 16n, price: 9n * 10n ** 17n },
    { feeRate: P - 1n, price: P + 1n },
  ];

  it.each(rates)(
    'returns the largest ETH that stays within the wstETH (fee $feeRate, price $price)',
    ({ feeRate, price }) => {
      for (const wsteth of samples) {
        const eth = calcFastStakeEthByWsteth(wsteth, feeRate, price);
        expect(
          calcFastStakeWstethByEth(eth, feeRate, price),
        ).toBeLessThanOrEqual(wsteth);
        expect(
          calcFastStakeWstethByEth(eth + 1n, feeRate, price),
        ).toBeGreaterThan(wsteth);
      }
    },
  );

  it('rejects a rate that cannot be inverted', () => {
    expect(() => calcFastStakeEthByWsteth(P, P, PRICE)).toThrow(
      'Invalid fast stake rate',
    );
    expect(() => calcFastStakeEthByWsteth(P, FEE, 0n)).toThrow(
      'Invalid fast stake rate',
    );
  });
});

describe('L2StakeModule', () => {
  describe('addresses', () => {
    it.each([CHAINS.Base, CHAINS.Linea, CHAINS.Arbitrum, CHAINS.Optimism])(
      'resolves the receiver and wstETH on chain %i',
      async (chainId) => {
        const { l2Stake } = createModule(chainId);
        const expected = l2Addresses(chainId);
        await expect(
          l2Stake.getL2StakingReceiverContractAddress(),
        ).resolves.toBe(expected.stakeReceiver);
        await expect(l2Stake.getL2StakingWstethContractAddress()).resolves.toBe(
          expected.wsteth,
        );
      },
    );

    it('rejects a chain without a receiver as not supported', async () => {
      const { l2Stake } = createModule(CHAINS.Mainnet);
      await expect(
        l2Stake.getL2StakingReceiverContractAddress(),
      ).rejects.toMatchObject({ code: ERROR_CODE.NOT_SUPPORTED });
    });
  });

  describe('rates and liquidity', () => {
    it('reads the fee from the pool and the price from its feed', async () => {
      const { l2Stake, publicClient } = createModule();
      await expect(l2Stake.getFastStakeRate()).resolves.toEqual({
        feeRate: FEE,
        price: PRICE,
      });
      const calls = publicClient.readContract.mock.calls.map(([call]) => call);
      expect(calls).toContainEqual(
        expect.objectContaining({
          address: l2Addresses(CHAINS.Base).stakeReceiver,
          functionName: 'getOraclePool',
        }),
      );
      expect(calls).toContainEqual(
        expect.objectContaining({ address: POOL, functionName: 'getFee' }),
      );
      expect(calls).toContainEqual(
        expect.objectContaining({ address: POOL, functionName: 'getOracle' }),
      );
      expect(calls).toContainEqual(
        expect.objectContaining({
          address: FEED,
          functionName: 'getLatestAnswer',
        }),
      );
    });

    it('converts both ways with the live rate', async () => {
      const { l2Stake } = createModule();
      await expect(l2Stake.getFastStakeWstethByEth(P)).resolves.toBe(
        calcFastStakeWstethByEth(P, FEE, PRICE),
      );
      await expect(l2Stake.getFastStakeEthByWsteth(P)).resolves.toBe(
        calcFastStakeEthByWsteth(P, FEE, PRICE),
      );
    });

    it('reports the pool wstETH balance and the ETH it can absorb', async () => {
      const { l2Stake, publicClient } = createModule();
      const liquidity = await l2Stake.getFastStakeLiquidity();

      expect(liquidity.wsteth).toBe(LIQUIDITY);
      expect(publicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: l2Addresses(CHAINS.Base).wsteth,
          functionName: 'balanceOf',
          args: [POOL],
        }),
      );
      // Boundary: the reported ETH is the most a stake can be without asking
      // for more wstETH than the pool holds
      expect(
        await l2Stake.getFastStakeWstethByEth(liquidity.eth),
      ).toBeLessThanOrEqual(LIQUIDITY);
      expect(
        await l2Stake.getFastStakeWstethByEth(liquidity.eth + 1n),
      ).toBeGreaterThan(LIQUIDITY);
    });
  });

  describe('transaction construction', () => {
    const amount = 3n * P;
    const minReceiveAmount = calcFastStakeWstethByEth(amount, FEE, PRICE);
    const receiver = l2Addresses(CHAINS.Base).stakeReceiver;

    it('populates an ETH stake call for the receiver', async () => {
      const { l2Stake } = createModule();
      const tx = await l2Stake.fastStakeEthPopulateTx({
        token: 'ETH',
        amount,
        minReceiveAmount,
        referral: REFERRAL,
      });

      expect(tx.to).toBe(receiver);
      expect(tx.from).toBe(ACCOUNT);
      expect(tx.value).toBe(amount);
      expect(decodeFastStake(tx.data)).toEqual([
        zeroAddress,
        amount,
        minReceiveAmount,
        getAddress(REFERRAL),
      ]);
    });

    it('populates a WETH stake call without ETH value', async () => {
      const { l2Stake } = createModule();
      const tx = await l2Stake.fastStakeEthPopulateTx({
        token: 'WETH',
        amount,
        minReceiveAmount,
        referral: REFERRAL,
      });

      expect(tx.value).toBe(0n);
      expect(decodeFastStake(tx.data)[0]).toBe(getAddress(WETH));
    });

    it('defaults the referral to the zero address', async () => {
      const { l2Stake } = createModule();
      const tx = await l2Stake.fastStakeEthPopulateTx({
        token: 'ETH',
        amount,
        minReceiveAmount,
      });
      expect(decodeFastStake(tx.data)[3]).toBe(zeroAddress);
    });

    it('uses the explicit account over the wallet account', async () => {
      const { l2Stake } = createModule();
      const other: Address = '0x00000000000000000000000000000000000000a2';
      const tx = await l2Stake.fastStakeEthPopulateTx({
        token: 'ETH',
        amount,
        minReceiveAmount,
        account: other,
      });
      expect(tx.from).toBe(other);
    });

    it('estimates gas for the same call with the ETH value', async () => {
      const { l2Stake, publicClient } = createModule();
      await expect(
        l2Stake.fastStakeEthEstimateGas({
          token: 'ETH',
          amount,
          minReceiveAmount,
          referral: REFERRAL,
        }),
      ).resolves.toBe(120_000n);

      expect(publicClient.estimateContractGas).toHaveBeenCalledWith(
        expect.objectContaining({
          address: receiver,
          functionName: 'fastStakeReferral',
          args: [zeroAddress, amount, minReceiveAmount, REFERRAL],
          account: expect.objectContaining({ address: ACCOUNT }),
          value: amount,
        }),
      );
    });

    it('signs the same calldata as the populated call', async () => {
      const { l2Stake, core, publicClient, walletClient } = createModule();
      const populated = await l2Stake.fastStakeEthPopulateTx({
        token: 'ETH',
        amount,
        minReceiveAmount,
        referral: REFERRAL,
      });

      const callback = vi.fn();
      await l2Stake.fastStakeEth({
        token: 'ETH',
        amount,
        minReceiveAmount,
        referral: REFERRAL,
        callback,
      });

      expect(core.useWalletClient).toHaveBeenCalled();
      expect(core.performTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          account: expect.objectContaining({ address: ACCOUNT }),
          callback,
        }),
      );
      expect(publicClient.estimateContractGas).toHaveBeenCalledWith(
        expect.objectContaining({ value: amount }),
      );

      const [write] = walletClient.writeContract.mock.calls[0] as unknown as [
        {
          address: Address;
          functionName: 'fastStakeReferral';
          args: readonly [Address, bigint, bigint, Address];
          value: bigint;
          gas: bigint;
        },
      ];
      expect(write.address).toBe(receiver);
      expect(write.value).toBe(amount);
      expect(write.gas).toBe(120_000n);
      expect(
        encodeFunctionData({
          abi: L2_STAKING_RECEIVER_ABI,
          functionName: write.functionName,
          args: write.args,
        }),
      ).toBe(populated.data);
    });

    it('sends a WETH stake without ETH value', async () => {
      const { l2Stake, walletClient } = createModule();
      await l2Stake.fastStakeEth({ token: 'WETH', amount, minReceiveAmount });

      expect(walletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [WETH, amount, minReceiveAmount, zeroAddress],
          value: 0n,
        }),
      );
    });
  });
});
