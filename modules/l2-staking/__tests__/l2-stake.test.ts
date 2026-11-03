import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeEventTopics,
  encodeFunctionData,
  getAddress,
  zeroAddress,
  type Address,
  type Hash,
} from 'viem';
import { CHAINS, ERROR_CODE } from '@lidofinance/lido-ethereum-sdk/common';

import { L2_STAKING_RECEIVER_ABI } from '../abi/l2-staking-receiver';
import { L2StakeModule } from '../l2-stake';
import {
  ACCOUNT,
  CCIP_BUCKET,
  FEE,
  FEED,
  LIQUIDITY,
  P,
  POOL,
  PRICE,
  REFERRAL,
  WETH,
  createModule,
  l2Addresses,
} from './module-harness';

const decodeFastStake = (data?: Hash) => {
  if (!data) throw new Error('populated tx has no calldata');
  const decoded = decodeFunctionData({ abi: L2_STAKING_RECEIVER_ABI, data });
  expect(decoded.functionName).toBe('fastStakeReferral');
  return decoded.args as readonly [Address, bigint, bigint, Address];
};

describe('calcFastStakeWstethByEth', () => {
  it('takes the fee from the ETH and prices the remainder', () => {
    // (1 - 0.001) / 1.2
    expect(L2StakeModule.calcFastStakeWstethByEth(P, FEE, PRICE)).toBe(
      832_500_000_000_000_000n,
    );
  });

  it('rounds down', () => {
    expect(L2StakeModule.calcFastStakeWstethByEth(P, 0n, PRICE)).toBe(
      833_333_333_333_333_333n,
    );
    expect(L2StakeModule.calcFastStakeWstethByEth(1n, 0n, PRICE)).toBe(0n);
  });

  it('is identity at par without a fee', () => {
    expect(L2StakeModule.calcFastStakeWstethByEth(P, 0n, P)).toBe(P);
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
        const eth = L2StakeModule.calcFastStakeEthByWsteth(
          wsteth,
          feeRate,
          price,
        );
        expect(
          L2StakeModule.calcFastStakeWstethByEth(eth, feeRate, price),
        ).toBeLessThanOrEqual(wsteth);
        expect(
          L2StakeModule.calcFastStakeWstethByEth(eth + 1n, feeRate, price),
        ).toBeGreaterThan(wsteth);
      }
    },
  );

  it('rejects a rate that cannot be inverted', () => {
    expect(() => L2StakeModule.calcFastStakeEthByWsteth(P, P, PRICE)).toThrow(
      'Invalid fast stake rate',
    );
    expect(() => L2StakeModule.calcFastStakeEthByWsteth(P, FEE, 0n)).toThrow(
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
        L2StakeModule.calcFastStakeWstethByEth(P, FEE, PRICE),
      );
      await expect(l2Stake.getFastStakeEthByWsteth(P)).resolves.toBe(
        L2StakeModule.calcFastStakeEthByWsteth(P, FEE, PRICE),
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
    const minReceiveAmount = L2StakeModule.calcFastStakeWstethByEth(
      amount,
      FEE,
      PRICE,
    );
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

  describe('receipt decoding', () => {
    const fastStakeLog = (address: Address) => ({
      address,
      topics: encodeEventTopics({
        abi: L2_STAKING_RECEIVER_ABI,
        eventName: 'FastStake',
        args: { user: ACCOUNT, token: zeroAddress },
      }),
      data: encodeAbiParameters(
        [{ type: 'uint256' }, { type: 'uint256' }],
        [3n * P, 2n * P],
      ),
    });
    const referralLog = (address: Address) => ({
      address,
      topics: encodeEventTopics({
        abi: L2_STAKING_RECEIVER_ABI,
        eventName: 'Referral',
        args: { user: ACCOUNT, referral: REFERRAL },
      }),
      data: encodeAbiParameters([{ type: 'uint256' }], [2n * P]),
    });
    const sender = l2Addresses(CHAINS.Base).stakeReceiver;

    it('reads the amounts and the referral from the sender events', async () => {
      const { l2Stake } = createModule();
      await expect(
        l2Stake.decodeFastStakeEvents({
          logs: [fastStakeLog(sender), referralLog(sender)],
        } as never),
      ).resolves.toEqual({
        user: getAddress(ACCOUNT),
        token: zeroAddress,
        amountIn: 3n * P,
        amountOut: 2n * P,
        referral: getAddress(REFERRAL),
      });
    });

    it('leaves the referral out when none was emitted', async () => {
      const { l2Stake } = createModule();
      const result = await l2Stake.decodeFastStakeEvents({
        logs: [fastStakeLog(sender)],
      } as never);
      expect(result.referral).toBeUndefined();
    });

    it('ignores the same event from another contract', async () => {
      const { l2Stake } = createModule();
      await expect(
        l2Stake.decodeFastStakeEvents({
          logs: [fastStakeLog(POOL)],
        } as never),
      ).rejects.toMatchObject({ code: ERROR_CODE.TRANSACTION_ERROR });
    });

    it('decodes the receipt of a sent stake', async () => {
      const { l2Stake, core } = createModule();
      await l2Stake.fastStakeEth({
        token: 'ETH',
        amount: P,
        minReceiveAmount: 0n,
      });
      expect(core.performTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ decodeResult: expect.any(Function) }),
      );
    });
  });

  describe('state', () => {
    const open = { isFastLaneAvailable: true, isSlowLaneAvailable: true };

    it('reports both lanes open from the sender, the pool, the router and the CCIP pool', async () => {
      const { l2Stake, publicClient } = createModule();
      await expect(l2Stake.fetchStakeState()).resolves.toEqual(open);
      const calls = publicClient.readContract.mock.calls.map(([call]) => call);
      expect(calls).toContainEqual(
        expect.objectContaining({ address: POOL, functionName: 'paused' }),
      );
      expect(calls).toContainEqual(
        expect.objectContaining({ functionName: 'getReceiver' }),
      );
    });

    it.each([
      ['pool is paused', { paused: true }],
      ['admin unset the oracle pool', { getOraclePool: zeroAddress }],
    ])('closes the fast lane when the %s', async (_, reads) => {
      const { l2Stake } = createModule(CHAINS.Base, { reads });
      await expect(l2Stake.fetchStakeState()).resolves.toEqual({
        ...open,
        isFastLaneAvailable: false,
      });
    });

    it('never reads a pool that is unset', async () => {
      const { l2Stake, publicClient } = createModule(CHAINS.Base, {
        reads: { getOraclePool: zeroAddress },
      });
      await l2Stake.fetchStakeState();
      expect(publicClient.readContract).not.toHaveBeenCalledWith(
        expect.objectContaining({ functionName: 'paused' }),
      );
    });

    it.each([
      ['admin unset the L1 receiver', { getReceiver: '0x' }],
      ['router drops the lane', { isChainSupported: false }],
      ['pool drops the chain', { isSupportedChain: false }],
      [
        'limiter closes with a zero capacity',
        {
          getCurrentOutboundRateLimiterState: {
            ...CCIP_BUCKET,
            capacity: 0n,
            tokens: 0n,
          },
        },
      ],
    ])('closes the slow lane when the %s', async (_, reads) => {
      const { l2Stake } = createModule(CHAINS.Base, { reads });
      await expect(l2Stake.fetchStakeState()).resolves.toEqual({
        ...open,
        isSlowLaneAvailable: false,
      });
    });

    it('treats a disabled limiter as open', async () => {
      const { l2Stake } = createModule(CHAINS.Base, {
        reads: {
          getCurrentOutboundRateLimiterState: {
            ...CCIP_BUCKET,
            isEnabled: false,
            capacity: 0n,
          },
        },
      });
      await expect(l2Stake.fetchStakeState()).resolves.toEqual(open);
    });
  });

  // The core prices txs from a fee-history sample; on Linea that sample is
  // unrelated to the L1-cost-driven tip the sequencer wants and gets charged
  // in full, so the stake and the approval are re-priced per tx
  describe('Linea fee quoting', () => {
    const amount = 3n * P;
    const minReceiveAmount = L2StakeModule.calcFastStakeWstethByEth(
      amount,
      FEE,
      PRICE,
    );
    const lineaFees = { maxFeePerGas: 14n + 256n, maxPriorityFeePerGas: 256n };

    it('re-prices the stake from linea_estimateGas for the exact calldata', async () => {
      const { l2Stake, publicClient, walletClient } = createModule(
        CHAINS.Linea,
      );
      const populated = await l2Stake.fastStakeEthPopulateTx({
        token: 'ETH',
        amount,
        minReceiveAmount,
        referral: REFERRAL,
      });
      await l2Stake.fastStakeEth({
        token: 'ETH',
        amount,
        minReceiveAmount,
        referral: REFERRAL,
      });

      expect(publicClient.request).toHaveBeenCalledWith({
        method: 'linea_estimateGas',
        params: [
          expect.objectContaining({
            from: ACCOUNT,
            to: populated.to,
            data: populated.data,
          }),
        ],
      });
      expect(publicClient.estimateContractGas).toHaveBeenCalledWith(
        expect.objectContaining(lineaFees),
      );
      expect(walletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({ ...lineaFees, value: amount }),
      );
    });

    it('re-prices the WETH approval too', async () => {
      const { l2Stake, publicClient, walletClient } = createModule(
        CHAINS.Linea,
      );
      await l2Stake.approveWeth({ amount });

      expect(publicClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'linea_estimateGas' }),
      );
      expect(walletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({ functionName: 'approve', ...lineaFees }),
      );
    });

    it('keeps the core price when the quote fails', async () => {
      const { l2Stake, publicClient, walletClient } = createModule(
        CHAINS.Linea,
      );
      // quoted for the estimate and again for the send
      publicClient.request.mockRejectedValue(new Error('rpc down'));
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await l2Stake.fastStakeEth({ token: 'ETH', amount, minReceiveAmount });

      const [write] = walletClient.writeContract.mock.calls[0] as unknown as [
        Record<string, unknown>,
      ];
      expect(write).not.toHaveProperty('maxFeePerGas');
    });

    it('does not quote on chains with a fee market', async () => {
      const { l2Stake, publicClient, walletClient } = createModule(CHAINS.Base);
      await l2Stake.fastStakeEth({ token: 'ETH', amount, minReceiveAmount });

      expect(publicClient.request).not.toHaveBeenCalled();
      const [write] = walletClient.writeContract.mock.calls[0] as unknown as [
        Record<string, unknown>,
      ];
      expect(write).not.toHaveProperty('maxFeePerGas');
    });
  });
});
