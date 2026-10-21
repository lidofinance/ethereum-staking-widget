import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  encodeAbiParameters,
  encodeEventTopics,
  erc20Abi,
  getAddress,
  parseEventLogs,
  zeroAddress,
  zeroHash,
  parseAbiParameters,
  type Abi,
  type Address,
  type Hash,
} from 'viem';
import { getL2TransactionHashes } from 'viem/op-stack';
import { CHAINS, ERROR_CODE } from '@lidofinance/lido-ethereum-sdk/common';

import { L1_STAKING_RECEIVER_ABI } from '../abi/l1-staking-receiver';
import {
  ARBITRUM_BRIDGE_ABI,
  ARBITRUM_INBOX_ABI,
  ARBITRUM_RETRYABLE_TX_ABI,
  OP_STACK_L2_CROSS_DOMAIN_MESSENGER_ABI,
} from '../abi/bridges';
import {
  ARBITRUM_RETRYABLE_TX_PRECOMPILE,
  OP_STACK_L2_CROSS_DOMAIN_MESSENGER,
} from '../const';
import { L2SlowStakeLookupError } from '../errors';
import {
  calculateArbitrumRetryableCreationId,
  decodeArbitrumSubmitRetryableMessage,
} from '../utils/arbitrum-retryable';
import { decodeSlowStakeData, encodeSlowStakeData } from '../utils/fee-codec';
import {
  ACCOUNT,
  L1_RECEIVER,
  P,
  WETH,
  createModule,
  l2Addresses,
  type ChainStub,
} from './module-harness';
import {
  RETURN_LEG_FIXTURES,
  type FixtureReceipt,
  type LaneFixture,
} from './fixtures/slow-stake-return-legs';

const MESSAGE_ID: Hash =
  '0xf50ff3791ba99db683b51a711436712b130ace8cb0f42789850b5f3cdc56cd5e';
const OTHER_MESSAGE_ID: Hash =
  '0x2222222222222222222222222222222222222222222222222222222222222222';
const SEND_TX: Hash =
  '0x3435a1409eafa7a896e7ac3b3222d5d5379373d412a480e3463f358217ab075e';
const L1_TX: Hash =
  '0x1d623b407783ea0023ba18673b39688383a7028fdc8d43d855553b46eba971c6';
const L1_WSTETH: Address = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
const L1_BRIDGE: Address = '0x00000000000000000000000000000000000000b1';
const AMOUNT = 2n * P;
const STAKED = 1_650_000_000_000_000_000n; // the wstETH it bought
const SEND_BLOCK = 155_730_938n;
const L1_BLOCK = 25_782_450n;
const L2_WSTETH = l2Addresses(CHAINS.Base).wsteth;
const SENDER = l2Addresses(CHAINS.Base).stakeReceiver;

// The real portal deposit log of the Base fixture: the L2 deposit
// transaction hash is a function of it, so the synthetic Base receipts
// below carry it and the L2 side is keyed by the hash viem derives
const BASE_PORTAL_LOG = RETURN_LEG_FIXTURES.base.l1Receipt.logs.find(
  (log) => log.address === '0x49048044d57e1c92a77f79988d21fa8faf74e97e',
);
if (!BASE_PORTAL_LOG) throw new Error('no portal log in the Base fixture');
const [BASE_L2_TX] = getL2TransactionHashes({ logs: [BASE_PORTAL_LOG] });
if (!BASE_L2_TX) throw new Error('no deposit hash from the portal log');

// a log as eth_getLogs returns it, from an event's ABI item and its args
const eventLog = (
  abi: Abi,
  eventName: string,
  args: Record<string, unknown>,
  address: Address,
  extra: { transactionHash: Hash; blockNumber: bigint; logIndex?: number },
) => {
  const item = abi.find(
    (entry) => entry.type === 'event' && entry.name === eventName,
  );
  if (!item || item.type !== 'event') throw new Error(`no event ${eventName}`);
  const topics = encodeEventTopics({ abi, eventName, args });
  const nonIndexed = item.inputs.filter((input) => !input.indexed);
  const data = encodeAbiParameters(
    nonIndexed,
    nonIndexed.map((input) => args[input.name ?? '']),
  );
  return { address, topics, data, logIndex: 0, removed: false, ...extra };
};

const FAILED_MESSAGE = {
  messageId: MESSAGE_ID,
  sourceChainSelector: 15971525489660198786n,
  sender: encodeAbiParameters(parseAbiParameters('address'), [SENDER]),
  data: encodeSlowStakeData(
    ACCOUNT,
    AMOUNT,
    '0x0000000000000000000000000000000000000186a0',
  ),
  destTokenAmounts: [
    {
      token: getAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
      amount: AMOUNT,
    },
  ],
};

// the receipt of an L1 execution that staked, or that failed inside
const l1Receipt = (
  outcome: 'succeeded' | 'failed',
  { messageId = MESSAGE_ID, blockNumber = L1_BLOCK, txHash = L1_TX } = {},
) => {
  const extra = { transactionHash: txHash, blockNumber };
  if (outcome === 'failed') {
    return {
      blockNumber,
      logs: [
        eventLog(
          L1_STAKING_RECEIVER_ABI,
          'MessageFailed',
          { messageId, message: FAILED_MESSAGE },
          L1_RECEIVER,
          extra,
        ),
      ],
    };
  }
  return {
    blockNumber,
    logs: [
      // the stake: wstETH minted to the receiver, then handed to the bridge
      eventLog(
        erc20Abi,
        'Transfer',
        { from: zeroAddress, to: L1_RECEIVER, value: STAKED },
        L1_WSTETH,
        extra,
      ),
      eventLog(
        erc20Abi,
        'Transfer',
        { from: L1_RECEIVER, to: L1_BRIDGE, value: STAKED },
        L1_WSTETH,
        extra,
      ),
      BASE_PORTAL_LOG,
      eventLog(
        L1_STAKING_RECEIVER_ABI,
        'BaseL1toL2MessageSent',
        {},
        L1_RECEIVER,
        extra,
      ),
      eventLog(
        L1_STAKING_RECEIVER_ABI,
        'MessageSucceeded',
        { messageId },
        L1_RECEIVER,
        extra,
      ),
    ],
  };
};

const MSG_HASH: Hash =
  '0x6666666666666666666666666666666666666666666666666666666666666666';

// the deposit transaction on the L2: the messenger's verdict and the mint
const l2Landing = (
  relay: 'relayed' | 'failed',
  {
    to = ACCOUNT,
    status = 'success',
  }: { to?: Address; status?: 'success' | 'reverted' } = {},
) => {
  const extra = { transactionHash: BASE_L2_TX, blockNumber: SEND_BLOCK + 900n };
  return {
    blockNumber: SEND_BLOCK + 900n,
    status,
    logs: [
      ...(relay === 'relayed'
        ? [
            eventLog(
              erc20Abi,
              'Transfer',
              { from: zeroAddress, to, value: STAKED },
              L2_WSTETH,
              extra,
            ),
          ]
        : []),
      eventLog(
        OP_STACK_L2_CROSS_DOMAIN_MESSENGER_ABI,
        relay === 'relayed' ? 'RelayedMessage' : 'FailedRelayedMessage',
        { msgHash: MSG_HASH },
        OP_STACK_L2_CROSS_DOMAIN_MESSENGER,
        extra,
      ),
    ],
  };
};

const ccipMessage = (
  status: string,
  overrides: Record<string, unknown> = {},
) => ({
  messageId: MESSAGE_ID,
  sourceNetworkInfo: { chainSelector: '15971525489660198786', chainId: '8453' },
  destNetworkInfo: { chainSelector: '5009297550715157269', chainId: '1' },
  sender: SENDER,
  receiver: L1_RECEIVER,
  status,
  sendTransactionHash: SEND_TX,
  sendBlockNumber: Number(SEND_BLOCK),
  readyForManualExecution: false,
  tokenAmounts: [],
  data: encodeSlowStakeData(
    ACCOUNT,
    AMOUNT,
    '0x0000000000000000000000000000000000000186a0',
  ),
  ...overrides,
});

type ListPage = { data: unknown[]; pagination: Record<string, unknown> };

// the API: messages by id, and the lane's list as pages keyed by cursor
const ccipApi = (
  answers: Record<string, unknown | null>,
  pages: Record<string, ListPage> = {},
) =>
  vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    const [, messageId] =
      /\/v2\/messages\/(0x[0-9a-f]+)/.exec(url.pathname) ?? [];
    if (!messageId && url.pathname.endsWith('/v2/messages')) {
      const page = pages[url.searchParams.get('cursor') ?? 'first'] ?? {
        data: [],
        pagination: { limit: 100, hasNextPage: false, cursor: null },
      };
      return new Response(JSON.stringify(page), { status: 200 });
    }
    const body = messageId ? answers[messageId] : undefined;
    if (body === undefined || body === null)
      return new Response(JSON.stringify({ error: 'NOT_FOUND' }), {
        status: 404,
      });
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;

const summary = (messageId: Hash, origin: Address) => ({
  messageId,
  sender: SENDER,
  receiver: L1_RECEIVER,
  origin,
  status: 'SUCCESS',
  sourceNetworkInfo: { chainSelector: '15971525489660198786', chainId: '8453' },
  destNetworkInfo: { chainSelector: '5009297550715157269', chainId: '1' },
  sendTransactionHash: SEND_TX,
  sendTimestamp: '2026-10-20T23:30:13.000Z',
});

const SENT = {
  messageId: MESSAGE_ID,
  user: ACCOUNT,
  token: WETH,
  amount: AMOUNT,
  sendTxHash: SEND_TX,
  sendBlockNumber: SEND_BLOCK,
};

const EXECUTED = ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX });

const l1Stub = (overrides: Partial<ChainStub> = {}): ChainStub => ({
  reads: { WSTETH: L1_WSTETH, getFailedMessageHash: zeroHash },
  receipts: { [L1_TX]: l1Receipt('succeeded') },
  blockNumber: L1_BLOCK + 10n,
  ...overrides,
});

const STAKED_ON_BASE = {
  l1TxHash: L1_TX,
  l1BlockNumber: L1_BLOCK,
  stakedAmount: STAKED,
  returnLeg: { bridge: 'op-stack', l2TxHash: BASE_L2_TX },
};

describe('getSlowStakeStatus', () => {
  it('is sent while the API does not list the message', async () => {
    const { l2Stake } = createModule(CHAINS.Base, { fetcher: ccipApi({}) });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toEqual({
      ...SENT,
      outcome: 'inflight',
      stage: 'sent',
      ccipExplorerUrl: `https://ccip.chain.link/msg/${MESSAGE_ID}`,
    });
  });

  it('is in transit until CCIP executes it', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: ccipMessage('COMMITTED') }),
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      outcome: 'inflight',
      stage: 'in_transit',
      ccipStatus: 'COMMITTED',
    });
  });

  it('reports a transport failure with whether manual execution is open', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('FAILED', { readyForManualExecution: true }),
      }),
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      outcome: 'error',
      stage: 'transport_failed',
      readyForManualExecution: true,
    });
  });

  it('needs an L1 client once the message executed', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: EXECUTED }),
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).rejects.toMatchObject({
      code: ERROR_CODE.NOT_SUPPORTED,
    });
  });

  it('is bridging from the L1 receipt until the deposit lands on the L2', async () => {
    const { l2Stake, l1PublicClient, publicClient } = createModule(
      CHAINS.Base,
      { fetcher: ccipApi({ [MESSAGE_ID]: EXECUTED }), l1: l1Stub() },
    );
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      outcome: 'inflight',
      stage: 'bridging',
      ...STAKED_ON_BASE,
    });
    expect(l1PublicClient?.getTransactionReceipt).toHaveBeenCalledWith({
      hash: L1_TX,
    });
    // the landing is read by the hash the portal log derives, nothing else
    expect(publicClient.getTransactionReceipt).toHaveBeenCalledWith({
      hash: BASE_L2_TX,
    });
    expect(publicClient.getTransactionReceipt).toHaveBeenCalledTimes(1);
  });

  it('is delivered once the deposit relayed and minted to the user', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: EXECUTED }),
      l1: l1Stub(),
      receipts: { [BASE_L2_TX]: l2Landing('relayed') },
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      outcome: 'success',
      stage: 'delivered',
      ...STAKED_ON_BASE,
      l2TxHash: BASE_L2_TX,
    });
  });

  it('is a failed relay when the messenger could not credit the user', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: EXECUTED }),
      l1: l1Stub(),
      receipts: { [BASE_L2_TX]: l2Landing('failed') },
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      outcome: 'error',
      stage: 'relay_failed',
      l2TxHash: BASE_L2_TX,
    });
  });

  it('is a failed relay when the deposit transaction reverted', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: EXECUTED }),
      l1: l1Stub(),
      receipts: {
        [BASE_L2_TX]: l2Landing('relayed', { status: 'reverted' }),
      },
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      outcome: 'error',
      stage: 'relay_failed',
    });
  });

  it('fails the lookup when a relayed deposit minted to someone else', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: EXECUTED }),
      l1: l1Stub(),
      receipts: { [BASE_L2_TX]: l2Landing('relayed', { to: L1_BRIDGE }) },
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).rejects.toMatchObject({
      code: ERROR_CODE.READ_ERROR,
    });
  });

  it('is parked while the receiver holds the failed message', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: EXECUTED }),
      l1: l1Stub({
        reads: {
          WSTETH: L1_WSTETH,
          getFailedMessageHash:
            '0x9ff61c1744ac0198d082bbe8e5e50d2acd88802d2a02afe26f0763f62a6a8d6b',
        },
        receipts: { [L1_TX]: l1Receipt('failed') },
      }),
    });
    const status = await l2Stake.getSlowStakeStatus(SENT);
    expect(status).toMatchObject({
      outcome: 'error',
      stage: 'parked',
      l1TxHash: L1_TX,
    });
    if (status.stage !== 'parked') throw new Error('not parked');
    expect(status.failedMessage).toEqual(FAILED_MESSAGE);
    // the retry carries the message the receiver stored
    const retry = await l2Stake.retryFailedMessagePopulateTx(
      status.failedMessage,
    );
    expect(retry.to).toBe(L1_RECEIVER);
    expect(retry.data.startsWith('0x')).toBe(true);
  });

  it('is recovered once the failed-message slot is clear, without a scan', async () => {
    const { l2Stake, l1PublicClient } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: EXECUTED }),
      l1: l1Stub({ receipts: { [L1_TX]: l1Receipt('failed') } }),
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      outcome: 'success',
      stage: 'recovered',
      l1TxHash: L1_TX,
      l1BlockNumber: L1_BLOCK,
    });
    expect(l1PublicClient?.getTransactionReceipt).toHaveBeenCalledTimes(1);
  });

  it('wraps an unreachable API as a lookup failure, not a status', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: (async () => {
        throw new TypeError('fetch failed');
      }) as unknown as typeof fetch,
    });
    const error = await l2Stake.getSlowStakeStatus(SENT).catch((e) => e);
    expect(error).toBeInstanceOf(L2SlowStakeLookupError);
    expect(error.source).toBe('ccip-api');
  });

  it('wraps an L2 read failure as a lookup failure, not as bridging', async () => {
    const { l2Stake, publicClient } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: EXECUTED }),
      l1: l1Stub(),
    });
    publicClient.getTransactionReceipt.mockRejectedValue(new Error('rpc down'));
    await expect(l2Stake.getSlowStakeStatus(SENT)).rejects.toMatchObject({
      name: 'L2SlowStakeLookupError',
      source: 'l2',
    });
  });
});

// The real receipts of one completed stake per lane, read the way the
// pipeline reads them: the landing is found by the key the L1 receipt
// leaves, and the derived keys match the chain
describe('the return leg on each lane', () => {
  const l1Of = (fixture: LaneFixture): ChainStub => ({
    reads: { WSTETH: L1_WSTETH, getFailedMessageHash: zeroHash },
    receipts: { [fixture.l1Receipt.transactionHash]: fixture.l1Receipt },
  });
  const byHash = (...receipts: (FixtureReceipt | undefined)[]) =>
    Object.fromEntries(
      receipts.flatMap((receipt) =>
        receipt ? [[receipt.transactionHash, receipt]] : [],
      ),
    );
  const userOf = (fixture: LaneFixture) =>
    decodeSlowStakeData(fixture.message.data as `0x${string}`).recipient;

  // the precompile's reply for a ticket that was redeemed or expired
  const noTicket = () =>
    new ContractFunctionExecutionError(
      new ContractFunctionRevertedError({
        abi: ARBITRUM_RETRYABLE_TX_ABI,
        functionName: 'getTimeout',
        data: '0x80698456',
      }),
      {
        abi: ARBITRUM_RETRYABLE_TX_ABI,
        functionName: 'getTimeout',
        args: [zeroHash],
        contractAddress: ARBITRUM_RETRYABLE_TX_PRECOMPILE,
      },
    );

  describe('Base (OP-stack)', () => {
    const fixture = RETURN_LEG_FIXTURES.base;
    const { messageId } = fixture.message;

    it('derives the deposit transaction from the portal log and reads it', async () => {
      const { l2Stake, publicClient } = createModule(CHAINS.Base, {
        fetcher: ccipApi({ [messageId]: fixture.message }),
        l1: l1Of(fixture),
        receipts: byHash(fixture.l2Receipt),
      });
      await expect(
        l2Stake.getSlowStakeStatusByMessageId(messageId),
      ).resolves.toMatchObject({
        outcome: 'success',
        stage: 'delivered',
        user: userOf(fixture),
        stakedAmount: 4_011_888_681_571_537_530n,
        returnLeg: {
          bridge: 'op-stack',
          l2TxHash: fixture.l2Receipt?.transactionHash,
        },
        l2TxHash: fixture.l2Receipt?.transactionHash,
      });
      expect(publicClient.getTransactionReceipt).toHaveBeenCalledTimes(1);
    });
  });

  describe('Arbitrum', () => {
    const fixture = RETURN_LEG_FIXTURES.arbitrum;
    const { creationReceipt, retryReceipt } = fixture;
    const { messageId } = fixture.message;
    if (!creationReceipt || !retryReceipt)
      throw new Error('the Arbitrum fixture lacks its L2 receipts');
    const ticketId = creationReceipt.transactionHash;
    const retryTx = retryReceipt.transactionHash;
    const ticketAlive = { getTimeout: 1_800_000_000n };
    const ticketGone = { getTimeout: noTicket() };

    it('derives the ticket id from the inbox and bridge logs', () => {
      const { logs } = fixture.l1Receipt;
      const [inbox] = parseEventLogs({ abi: ARBITRUM_INBOX_ABI, logs });
      const [bridge] = parseEventLogs({ abi: ARBITRUM_BRIDGE_ABI, logs });
      if (!inbox || !bridge) throw new Error('fixture lacks the inbox logs');
      expect(bridge.args.kind).toBe(9);
      expect(
        calculateArbitrumRetryableCreationId({
          l2ChainId: 42161n,
          messageNumber: inbox.args.messageNum,
          from: bridge.args.sender,
          l1BaseFee: bridge.args.baseFeeL1,
          ...decodeArbitrumSubmitRetryableMessage(inbox.args.data),
        }),
      ).toBe(ticketId);
    });

    it('is delivered through the scheduled auto-redeem', async () => {
      const { l2Stake, publicClient } = createModule(CHAINS.Arbitrum, {
        fetcher: ccipApi({ [messageId]: fixture.message }),
        l1: l1Of(fixture),
        receipts: byHash(creationReceipt, retryReceipt),
      });
      await expect(
        l2Stake.getSlowStakeStatusByMessageId(messageId),
      ).resolves.toMatchObject({
        outcome: 'success',
        stage: 'delivered',
        user: userOf(fixture),
        returnLeg: { bridge: 'arbitrum', ticketId },
        l2TxHash: retryTx,
      });
      // the creation receipt and the retry receipt; no ticket probe
      expect(publicClient.getTransactionReceipt).toHaveBeenCalledTimes(2);
      expect(publicClient.readContract).not.toHaveBeenCalledWith(
        expect.objectContaining({ functionName: 'getTimeout' }),
      );
    });

    it('is bridging until the ticket is created on the L2', async () => {
      const { l2Stake } = createModule(CHAINS.Arbitrum, {
        fetcher: ccipApi({ [messageId]: fixture.message }),
        l1: l1Of(fixture),
      });
      await expect(
        l2Stake.getSlowStakeStatusByMessageId(messageId),
      ).resolves.toMatchObject({ outcome: 'inflight', stage: 'bridging' });
    });

    it('is a failed relay while a ticket whose auto-redeem reverted is alive', async () => {
      const revertedRetry = { ...retryReceipt, status: 'reverted' as const };
      const { l2Stake } = createModule(CHAINS.Arbitrum, {
        fetcher: ccipApi({ [messageId]: fixture.message }),
        l1: l1Of(fixture),
        reads: ticketAlive,
        receipts: byHash(creationReceipt, revertedRetry),
      });
      await expect(
        l2Stake.getSlowStakeStatusByMessageId(messageId),
      ).resolves.toMatchObject({
        outcome: 'error',
        stage: 'relay_failed',
        l2TxHash: retryTx,
      });
    });

    it('is unresolved once such a ticket is gone', async () => {
      const revertedRetry = { ...retryReceipt, status: 'reverted' as const };
      const { l2Stake } = createModule(CHAINS.Arbitrum, {
        fetcher: ccipApi({ [messageId]: fixture.message }),
        l1: l1Of(fixture),
        reads: ticketGone,
        receipts: byHash(creationReceipt, revertedRetry),
      });
      await expect(
        l2Stake.getSlowStakeStatusByMessageId(messageId),
      ).resolves.toMatchObject({ outcome: 'error', stage: 'unresolved' });
    });

    it('is a failed relay when no auto-redeem was scheduled', async () => {
      const bareCreation = { ...creationReceipt, logs: [] };
      const { l2Stake } = createModule(CHAINS.Arbitrum, {
        fetcher: ccipApi({ [messageId]: fixture.message }),
        l1: l1Of(fixture),
        reads: ticketAlive,
        receipts: byHash(bareCreation),
      });
      await expect(
        l2Stake.getSlowStakeStatusByMessageId(messageId),
      ).resolves.toMatchObject({
        outcome: 'error',
        stage: 'relay_failed',
        l2TxHash: undefined,
      });
    });
  });

  describe('Linea', () => {
    const fixture = RETURN_LEG_FIXTURES.linea;
    const { messageId } = fixture.message;
    const MESSAGE_HASH =
      '0x5f39f869cf1d00b8cbb20a2bda4ce7a11e4432ecff340497b115387be0c1edcb';

    it('is delivered once the L2 message service reports the claim', async () => {
      const { l2Stake, publicClient } = createModule(CHAINS.Linea, {
        fetcher: ccipApi({ [messageId]: fixture.message }),
        l1: l1Of(fixture),
        reads: { inboxL1L2MessageStatus: 2n },
      });
      await expect(
        l2Stake.getSlowStakeStatusByMessageId(messageId),
      ).resolves.toMatchObject({
        outcome: 'success',
        stage: 'delivered',
        returnLeg: { bridge: 'linea', messageHash: MESSAGE_HASH },
        l2TxHash: undefined,
      });
      expect(publicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'inboxL1L2MessageStatus',
          args: [MESSAGE_HASH],
        }),
      );
      expect(publicClient.getTransactionReceipt).not.toHaveBeenCalled();
    });

    it('is bridging while the message is only anchored', async () => {
      const { l2Stake } = createModule(CHAINS.Linea, {
        fetcher: ccipApi({ [messageId]: fixture.message }),
        l1: l1Of(fixture),
        reads: { inboxL1L2MessageStatus: 1n },
      });
      await expect(
        l2Stake.getSlowStakeStatusByMessageId(messageId),
      ).resolves.toMatchObject({ outcome: 'inflight', stage: 'bridging' });
    });
  });
});

describe('getSlowStakeStatusByMessageId', () => {
  it('rebuilds the send from the API message', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: ccipMessage('COMMITTED') }),
    });
    await expect(
      l2Stake.getSlowStakeStatusByMessageId(MESSAGE_ID),
    ).resolves.toMatchObject({
      stage: 'in_transit',
      user: getAddress(ACCOUNT),
      amount: AMOUNT,
      sendTxHash: SEND_TX,
      sendBlockNumber: SEND_BLOCK,
    });
  });

  it('is null for an unknown message', async () => {
    const { l2Stake } = createModule(CHAINS.Base, { fetcher: ccipApi({}) });
    await expect(
      l2Stake.getSlowStakeStatusByMessageId(MESSAGE_ID),
    ).resolves.toBeNull();
  });

  it('rejects a message from another chain', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('COMMITTED', {
          sourceNetworkInfo: {
            chainSelector: '3734403246176062136',
            chainId: '10',
          },
        }),
      }),
    });
    await expect(
      l2Stake.getSlowStakeStatusByMessageId(MESSAGE_ID),
    ).rejects.toMatchObject({ code: ERROR_CODE.NOT_SUPPORTED });
  });
});

describe('getSlowStakeSentFromCcipApi', () => {
  const KEEPER: Address = '0x00000000000000000000000000000000000000c0';

  it('walks the lane list, keeps the sends the user signed, oldest first', async () => {
    const fetcher = ccipApi(
      {
        [MESSAGE_ID]: EXECUTED,
        [OTHER_MESSAGE_ID]: ccipMessage('COMMITTED', {
          messageId: OTHER_MESSAGE_ID,
          sendBlockNumber: Number(SEND_BLOCK) + 100,
        }),
      },
      {
        first: {
          data: [
            summary(OTHER_MESSAGE_ID, ACCOUNT),
            summary(MESSAGE_ID, KEEPER),
          ],
          pagination: { limit: 2, hasNextPage: true, cursor: 'next' },
        },
        next: {
          data: [summary(MESSAGE_ID, ACCOUNT)],
          pagination: { limit: 2, hasNextPage: false, cursor: null },
        },
      },
    );
    const { l2Stake } = createModule(CHAINS.Base, { fetcher });
    const sent = await l2Stake.getSlowStakeSentFromCcipApi({
      account: ACCOUNT,
      pageSize: 2,
    });
    expect(sent.map((s) => [s.messageId, s.sendBlockNumber])).toEqual([
      [MESSAGE_ID, SEND_BLOCK],
      [OTHER_MESSAGE_ID, SEND_BLOCK + 100n],
    ]);
    expect(sent[0]).toMatchObject({
      user: getAddress(ACCOUNT),
      amount: AMOUNT,
      token: WETH,
    });
    const listCalls = vi
      .mocked(fetcher)
      .mock.calls.map(([url]) => new URL(String(url)))
      .filter((url) => url.pathname.endsWith('/v2/messages'));
    expect(listCalls).toHaveLength(2);
    const [firstPage, secondPage] = listCalls;
    expect(Object.fromEntries(firstPage?.searchParams ?? [])).toEqual({
      sender: SENDER,
      sourceChainSelector: '15971525489660198786',
      destChainSelector: '5009297550715157269',
      limit: '2',
    });
    expect(secondPage?.searchParams.get('cursor')).toBe('next');
  });

  it('stops at the page cap', async () => {
    const page = {
      data: [summary(MESSAGE_ID, KEEPER)],
      pagination: { limit: 1, hasNextPage: true, cursor: 'next' },
    };
    const fetcher = ccipApi({}, { first: page, next: page });
    const { l2Stake } = createModule(CHAINS.Base, { fetcher });
    await expect(
      l2Stake.getSlowStakeSentFromCcipApi({ account: ACCOUNT, maxPages: 2 }),
    ).resolves.toEqual([]);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe('getLatestSlowStakeStatusesFromCcipApi', () => {
  const api = () =>
    ccipApi(
      {
        [MESSAGE_ID]: ccipMessage('FAILED'),
        [OTHER_MESSAGE_ID]: ccipMessage('COMMITTED', {
          messageId: OTHER_MESSAGE_ID,
          sendBlockNumber: Number(SEND_BLOCK) + 100,
        }),
      },
      {
        first: {
          data: [
            summary(OTHER_MESSAGE_ID, ACCOUNT),
            summary(MESSAGE_ID, ACCOUNT),
          ],
          pagination: { limit: 100, hasNextPage: false, cursor: null },
        },
      },
    );

  it('stacks the statuses by outcome, newest first', async () => {
    const fetcher = api();
    const { l2Stake } = createModule(CHAINS.Base, { fetcher });
    const latest = await l2Stake.getLatestSlowStakeStatusesFromCcipApi({
      account: ACCOUNT,
    });
    expect(latest.inflight.map((status) => status.messageId)).toEqual([
      OTHER_MESSAGE_ID,
    ]);
    expect(latest.error.map((status) => status.messageId)).toEqual([
      MESSAGE_ID,
    ]);
    expect(latest.success).toEqual([]);
    expect(latest.hasMore).toBe(false);
    // one list page, one fetch per message, nothing twice
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('resolves only the newest sends and says more exist', async () => {
    const { l2Stake } = createModule(CHAINS.Base, { fetcher: api() });
    const latest = await l2Stake.getLatestSlowStakeStatusesFromCcipApi({
      account: ACCOUNT,
      limit: 1,
    });
    expect(latest.inflight.map((status) => status.messageId)).toEqual([
      OTHER_MESSAGE_ID,
    ]);
    expect(latest.error).toEqual([]);
    expect(latest.hasMore).toBe(true);
  });

  it('is empty without sends', async () => {
    const { l2Stake } = createModule(CHAINS.Base, { fetcher: ccipApi({}) });
    await expect(
      l2Stake.getLatestSlowStakeStatusesFromCcipApi({ account: ACCOUNT }),
    ).resolves.toEqual({
      inflight: [],
      error: [],
      success: [],
      hasMore: false,
    });
  });
});
