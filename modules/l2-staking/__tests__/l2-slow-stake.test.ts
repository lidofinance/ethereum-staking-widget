import {
  decodeFunctionData,
  encodeEventTopics,
  encodeAbiParameters,
  getAddress,
  parseEther,
  zeroAddress,
  type Address,
  type Hash,
  type Hex,
} from 'viem';
import { CHAINS, ERROR_CODE } from '@lidofinance/lido-ethereum-sdk/common';

import { L2_STAKING_RECEIVER_ABI } from '../abi/l2-staking-receiver';
import { L2StakeModule } from '../l2-stake';
import {
  CCIP_ETHEREUM_CHAIN_SELECTOR,
  LIDO_L2_SLOW_STAKE_LANES,
} from '../const';
import {
  applySlowStakeMaxFeeBuffer,
  buildSlowStakeCcipMessage,
  decodeFeeDtoOAmount,
  encodeFeeDtoO,
  encodeFeeOtoD,
} from '../utils/fee-codec';
import {
  ACCOUNT,
  CCIP_BUCKET,
  CCIP_FEE_QUOTE,
  CCIP_ONRAMP,
  CCIP_POOL,
  CCIP_ROUTER,
  L1_RECEIVER_BYTES,
  P,
  WETH,
  createModule,
  l2Addresses,
} from './module-harness';

const laneOf = (chainId: CHAINS) => {
  const lane = LIDO_L2_SLOW_STAKE_LANES[chainId];
  if (!lane) throw new Error(`lane ${chainId} is not configured`);
  return lane;
};

const decodeSlowStake = (data?: Hash) => {
  if (!data) throw new Error('populated tx has no calldata');
  const decoded = decodeFunctionData({ abi: L2_STAKING_RECEIVER_ABI, data });
  expect(decoded.functionName).toBe('slowStake');
  return decoded.args as readonly [bigint, Address, bigint, Hex, Hex];
};

describe('calcSlowStakeLimits', () => {
  const feeDtoO = 1_005_000_000_000_000n;

  it('lowers the stake caps by the return-leg budget', () => {
    const limits = L2StakeModule.calcSlowStakeLimits(CCIP_BUCKET, feeDtoO);
    expect(limits).toEqual({
      isEnabled: true,
      capacity: CCIP_BUCKET.capacity,
      available: CCIP_BUCKET.tokens,
      rate: CCIP_BUCKET.rate,
      lastUpdated: CCIP_BUCKET.lastUpdated,
      maxAmount: CCIP_BUCKET.capacity - feeDtoO,
      availableAmount: CCIP_BUCKET.tokens - feeDtoO,
    });
  });

  it('never reports a negative cap', () => {
    const limits = L2StakeModule.calcSlowStakeLimits(
      { ...CCIP_BUCKET, tokens: 1n, capacity: 2n },
      feeDtoO,
    );
    expect(limits.maxAmount).toBe(0n);
    expect(limits.availableAmount).toBe(0n);
  });

  it('reports no caps while the limiter is off', () => {
    const limits = L2StakeModule.calcSlowStakeLimits(
      { ...CCIP_BUCKET, isEnabled: false },
      feeDtoO,
    );
    expect(limits.maxAmount).toBeUndefined();
    expect(limits.availableAmount).toBeUndefined();
  });
});

describe('calcSlowStakeWaitSeconds', () => {
  const limits = L2StakeModule.calcSlowStakeLimits(CCIP_BUCKET, 0n);

  it('is zero for what fits now', () => {
    expect(
      L2StakeModule.calcSlowStakeWaitSeconds(limits, CCIP_BUCKET.tokens),
    ).toBe(0);
    expect(L2StakeModule.calcSlowStakeWaitSeconds(limits, 1n)).toBe(0);
  });

  it('rounds the refill wait up to the next second', () => {
    const missing = CCIP_BUCKET.rate * 10n + 1n;
    expect(
      L2StakeModule.calcSlowStakeWaitSeconds(
        limits,
        CCIP_BUCKET.tokens + missing,
      ),
    ).toBe(11);
    expect(
      L2StakeModule.calcSlowStakeWaitSeconds(
        limits,
        CCIP_BUCKET.tokens + CCIP_BUCKET.rate,
      ),
    ).toBe(1);
  });

  it('is undefined above the capacity, where waiting does not help', () => {
    expect(
      L2StakeModule.calcSlowStakeWaitSeconds(limits, CCIP_BUCKET.capacity + 1n),
    ).toBeUndefined();
  });

  it('is undefined when the bucket does not refill', () => {
    const stalled = L2StakeModule.calcSlowStakeLimits(
      { ...CCIP_BUCKET, rate: 0n },
      0n,
    );
    expect(
      L2StakeModule.calcSlowStakeWaitSeconds(stalled, CCIP_BUCKET.tokens + 1n),
    ).toBeUndefined();
  });

  it('is zero without a limiter', () => {
    const off = L2StakeModule.calcSlowStakeLimits(
      { ...CCIP_BUCKET, isEnabled: false },
      0n,
    );
    expect(L2StakeModule.calcSlowStakeWaitSeconds(off, 10n ** 30n)).toBe(0);
  });
});

describe('L2StakeModule slow stake', () => {
  describe('config', () => {
    it.each([CHAINS.Base, CHAINS.Optimism, CHAINS.Arbitrum, CHAINS.Linea])(
      'resolves the lane on chain %i against the sender',
      async (chainId) => {
        const { l2Stake, publicClient } = createModule(chainId);
        const lane = laneOf(chainId);
        const feeDtoO = encodeFeeDtoO(lane.returnFee);
        await expect(l2Stake.getSlowStakeConfig()).resolves.toEqual({
          destChainSelector: CCIP_ETHEREUM_CHAIN_SELECTOR,
          receiver: L1_RECEIVER_BYTES,
          gasLimit: lane.gasLimit,
          feeDtoO,
          feeAmountDtoO: decodeFeeDtoOAmount(feeDtoO),
          minProcessMessageGas: 200_000n,
        });
        expect(publicClient.readContract).toHaveBeenCalledWith(
          expect.objectContaining({
            address: l2Addresses(chainId).stakeReceiver,
            functionName: 'getReceiver',
            args: [CCIP_ETHEREUM_CHAIN_SELECTOR],
          }),
        );
      },
    );

    it('rejects a chain without a lane as not supported', async () => {
      const { l2Stake } = createModule(CHAINS.Mainnet);
      expect(() => l2Stake.getSlowStakeLaneConfig()).toThrow(
        expect.objectContaining({ code: ERROR_CODE.NOT_SUPPORTED }),
      );
    });

    it('rejects a lane whose receiver is not set', async () => {
      const { l2Stake } = createModule(CHAINS.Base, {
        reads: { getReceiver: '0x' },
      });
      await expect(l2Stake.getSlowStakeConfig()).rejects.toMatchObject({
        code: ERROR_CODE.NOT_SUPPORTED,
      });
    });

    it('rejects a gas limit below the sender floor', async () => {
      const { l2Stake } = createModule(CHAINS.Base, {
        reads: { MIN_PROCESS_MESSAGE_GAS: 2_000_000 },
      });
      await expect(l2Stake.getSlowStakeConfig()).rejects.toMatchObject({
        code: ERROR_CODE.NOT_SUPPORTED,
      });
    });
  });

  describe('limits', () => {
    it('finds the WETH pool through the router and reads its outbound bucket', async () => {
      const { l2Stake, publicClient } = createModule(CHAINS.Arbitrum);
      const limits = await l2Stake.fetchSlowStakeLimits();
      const { feeAmountDtoO } = await l2Stake.getSlowStakeConfig();

      expect(limits).toEqual(
        L2StakeModule.calcSlowStakeLimits(CCIP_BUCKET, feeAmountDtoO),
      );
      const calls = publicClient.readContract.mock.calls.map(([call]) => call);
      expect(calls).toContainEqual(
        expect.objectContaining({
          address: CCIP_ROUTER,
          functionName: 'getOnRamp',
          args: [CCIP_ETHEREUM_CHAIN_SELECTOR],
        }),
      );
      expect(calls).toContainEqual(
        expect.objectContaining({
          address: CCIP_ONRAMP,
          functionName: 'getPoolBySourceToken',
          args: [CCIP_ETHEREUM_CHAIN_SELECTOR, WETH],
        }),
      );
      expect(calls).toContainEqual(
        expect.objectContaining({
          address: CCIP_POOL,
          functionName: 'getCurrentOutboundRateLimiterState',
          args: [CCIP_ETHEREUM_CHAIN_SELECTOR],
        }),
      );
    });

    it('rejects a lane without a WETH pool', async () => {
      const { l2Stake } = createModule(CHAINS.Base, {
        reads: { getPoolBySourceToken: zeroAddress },
      });
      await expect(l2Stake.fetchSlowStakeLimits()).rejects.toMatchObject({
        code: ERROR_CODE.NOT_SUPPORTED,
      });
    });
  });

  describe('fee quote', () => {
    const amount = 3n * P;

    it('quotes the router on the message the sender builds', async () => {
      const { l2Stake, publicClient } = createModule(CHAINS.Arbitrum);
      const fee = await l2Stake.fetchSlowStakeFee({ amount, account: ACCOUNT });
      const config = await l2Stake.getSlowStakeConfig();

      expect(fee).toEqual({
        ccipFee: CCIP_FEE_QUOTE,
        maxFee: applySlowStakeMaxFeeBuffer(CCIP_FEE_QUOTE),
        feeAmountDtoO: config.feeAmountDtoO,
        total: CCIP_FEE_QUOTE + config.feeAmountDtoO,
        gasLimit: config.gasLimit,
      });
      expect(config.feeAmountDtoO).toBeGreaterThan(0n);
      expect(publicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: CCIP_ROUTER,
          functionName: 'getFee',
          args: [
            CCIP_ETHEREUM_CHAIN_SELECTOR,
            buildSlowStakeCcipMessage({
              receiver: L1_RECEIVER_BYTES,
              recipient: ACCOUNT,
              token: WETH,
              amount,
              feeDtoO: config.feeDtoO,
              feeAmountDtoO: config.feeAmountDtoO,
              gasLimit: config.gasLimit,
            }),
          ],
        }),
      );
    });

    it('quotes without an account for a visitor', async () => {
      const { l2Stake, publicClient } = createModule();
      await l2Stake.fetchSlowStakeFee({ amount });
      const call = publicClient.readContract.mock.calls
        .map(([call]) => call)
        .find((call) => call.functionName === 'getFee');
      const [, message] = call?.args as [bigint, { data: Hex }];
      expect(message.data.startsWith(zeroAddress)).toBe(true);
    });

    it('rejects a zero amount', async () => {
      const { l2Stake } = createModule();
      await expect(l2Stake.fetchSlowStakeFee({ amount: 0n })).rejects.toThrow();
    });
  });

  describe('transaction construction', () => {
    const amount = 3n * P;
    const maxFee = applySlowStakeMaxFeeBuffer(CCIP_FEE_QUOTE);

    it('populates an ETH stake that fronts the stake, the return budget and the cap', async () => {
      const { l2Stake } = createModule(CHAINS.Arbitrum);
      const config = await l2Stake.getSlowStakeConfig();
      const tx = await l2Stake.slowStakePopulateTx({
        token: 'ETH',
        amount,
        maxFee,
      });

      expect(tx.to).toBe(l2Addresses(CHAINS.Arbitrum).stakeReceiver);
      expect(tx.from).toBe(ACCOUNT);
      expect(tx.value).toBe(amount + config.feeAmountDtoO + maxFee);
      expect(decodeSlowStake(tx.data)).toEqual([
        CCIP_ETHEREUM_CHAIN_SELECTOR,
        zeroAddress,
        amount,
        encodeFeeOtoD({ maxFee, payInLink: false, gasLimit: config.gasLimit }),
        config.feeDtoO,
      ]);
    });

    it('populates a WETH stake that fronts only the fees', async () => {
      const { l2Stake } = createModule(CHAINS.Arbitrum);
      const config = await l2Stake.getSlowStakeConfig();
      const tx = await l2Stake.slowStakePopulateTx({
        token: 'WETH',
        amount,
        maxFee,
      });

      expect(tx.value).toBe(config.feeAmountDtoO + maxFee);
      expect(decodeSlowStake(tx.data)[1]).toBe(getAddress(WETH));
    });

    it('fronts nothing but the cap on a lane with a free return leg', async () => {
      const { l2Stake } = createModule(CHAINS.Optimism);
      const tx = await l2Stake.slowStakePopulateTx({
        token: 'WETH',
        amount,
        maxFee,
      });
      expect(tx.value).toBe(maxFee);
    });

    it('estimates gas for the same call with the value', async () => {
      const { l2Stake, publicClient } = createModule(CHAINS.Base);
      await expect(
        l2Stake.slowStakeEstimateGas({ token: 'ETH', amount, maxFee }),
      ).resolves.toBe(120_000n);
      expect(publicClient.estimateContractGas).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'slowStake',
          account: expect.objectContaining({ address: ACCOUNT }),
          value: amount + maxFee,
        }),
      );
    });

    it('signs the same calldata as the populated call', async () => {
      const { l2Stake, core, walletClient } = createModule(CHAINS.Base);
      const populated = await l2Stake.slowStakePopulateTx({
        token: 'ETH',
        amount,
        maxFee,
      });
      const callback = vi.fn();
      await l2Stake.slowStake({ token: 'ETH', amount, maxFee, callback });

      expect(core.useWalletClient).toHaveBeenCalled();
      expect(core.performTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          callback,
          decodeResult: expect.any(Function),
        }),
      );
      const [write] = walletClient.writeContract.mock.calls[0] as unknown as [
        { functionName: string; args: unknown[]; value: bigint; gas: bigint },
      ];
      expect(write.functionName).toBe('slowStake');
      expect(write.value).toBe(populated.value);
      expect(write.gas).toBe(120_000n);
      expect(decodeSlowStake(populated.data)).toEqual(write.args);
    });

    it('re-prices the stake on Linea for the exact calldata', async () => {
      const { l2Stake, publicClient } = createModule(CHAINS.Linea);
      const populated = await l2Stake.slowStakePopulateTx({
        token: 'ETH',
        amount,
        maxFee,
      });
      await l2Stake.slowStake({ token: 'ETH', amount, maxFee });
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
    });
  });

  describe('receipt decoding', () => {
    const messageId: Hash =
      '0xf50ff3791ba99db683b51a711436712b130ace8cb0f42789850b5f3cdc56cd5e';
    const slowStakeLog = (address: Address) => ({
      address,
      topics: encodeEventTopics({
        abi: L2_STAKING_RECEIVER_ABI,
        eventName: 'SlowStake',
        args: {
          user: ACCOUNT,
          destChainSelector: CCIP_ETHEREUM_CHAIN_SELECTOR,
          token: WETH,
        },
      }),
      data: encodeAbiParameters(
        [{ type: 'bytes32' }, { type: 'uint256' }],
        [messageId, parseEther('1')],
      ),
    });

    it('reads the message id from the sender event', async () => {
      const { l2Stake } = createModule(CHAINS.Base);
      const sender = l2Addresses(CHAINS.Base).stakeReceiver;
      await expect(
        l2Stake.decodeSlowStakeEvents({
          logs: [slowStakeLog(sender)],
        } as never),
      ).resolves.toEqual({
        messageId,
        user: getAddress(ACCOUNT),
        token: getAddress(WETH),
        amount: parseEther('1'),
      });
    });

    it('ignores the same event from another contract', async () => {
      const { l2Stake } = createModule(CHAINS.Base);
      await expect(
        l2Stake.decodeSlowStakeEvents({
          logs: [slowStakeLog(CCIP_POOL)],
        } as never),
      ).rejects.toMatchObject({ code: ERROR_CODE.TRANSACTION_ERROR });
    });
  });
});
