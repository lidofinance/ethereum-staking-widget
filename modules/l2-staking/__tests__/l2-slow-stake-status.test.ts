import {
  encodeAbiParameters,
  encodeEventTopics,
  erc20Abi,
  getAddress,
  zeroAddress,
  zeroHash,
  parseAbiParameters,
  type Abi,
  type Address,
  type Hash,
} from 'viem';
import { CHAINS, ERROR_CODE } from '@lidofinance/lido-ethereum-sdk/common';

import { L2_STAKING_RECEIVER_ABI } from '../l2-staking-abi';
import { L1_STAKING_RECEIVER_ABI } from '../l1-receiver-abi';
import { L2SlowStakeLookupError } from '../errors';
import { encodeSlowStakeData } from '../fee-codec';
import {
  ACCOUNT,
  L1_RECEIVER,
  P,
  WETH,
  createModule,
  l2Addresses,
  type ChainStub,
  type LogsRequest,
} from './module-harness';

const MESSAGE_ID: Hash =
  '0xf50ff3791ba99db683b51a711436712b130ace8cb0f42789850b5f3cdc56cd5e';
const OTHER_MESSAGE_ID: Hash =
  '0x2222222222222222222222222222222222222222222222222222222222222222';
const SEND_TX: Hash =
  '0x3435a1409eafa7a896e7ac3b3222d5d5379373d412a480e3463f358217ab075e';
const L1_TX: Hash =
  '0x1d623b407783ea0023ba18673b39688383a7028fdc8d43d855553b46eba971c6';
const RETRY_TX: Hash =
  '0x3333333333333333333333333333333333333333333333333333333333333333';
const L2_MINT_TX: Hash =
  '0x4444444444444444444444444444444444444444444444444444444444444444';
const L1_WSTETH: Address = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
const L1_BRIDGE: Address = '0x00000000000000000000000000000000000000b1';
const AMOUNT = 2n * P;
const STAKED = 1_650_000_000_000_000_000n; // the wstETH it bought
const SEND_BLOCK = 155_730_938n;
const L1_BLOCK = 25_782_450n;
const L2_WSTETH = l2Addresses(CHAINS.Base).wsteth;
const SENDER = l2Addresses(CHAINS.Base).stakeReceiver;

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

const slowStakeLog = (messageId: Hash, blockNumber: bigint, amount = AMOUNT) =>
  eventLog(
    L2_STAKING_RECEIVER_ABI,
    'SlowStake',
    {
      user: ACCOUNT,
      destChainSelector: 5009297550715157269n,
      messageId,
      token: WETH,
      amount,
    },
    SENDER,
    { transactionHash: SEND_TX, blockNumber },
  );

const mintLog = (
  value: bigint,
  blockNumber: bigint,
  transactionHash = L2_MINT_TX,
) =>
  eventLog(
    erc20Abi,
    'Transfer',
    { from: zeroAddress, to: ACCOUNT, value },
    L2_WSTETH,
    { transactionHash, blockNumber },
  );

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
  outcome: 'succeeded' | 'failed' | 'recovered',
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
      eventLog(
        L1_STAKING_RECEIVER_ABI,
        'BaseL1toL2MessageSent',
        {},
        L1_RECEIVER,
        extra,
      ),
      eventLog(
        L1_STAKING_RECEIVER_ABI,
        outcome === 'recovered' ? 'MessageRecovered' : 'MessageSucceeded',
        { messageId },
        L1_RECEIVER,
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

const l1Stub = (overrides: Partial<ChainStub> = {}): ChainStub => ({
  reads: { WSTETH: L1_WSTETH, getFailedMessageHash: zeroHash },
  receipts: { [L1_TX]: l1Receipt('succeeded') },
  blockNumber: L1_BLOCK + 10n,
  ...overrides,
});

describe('getSlowStakeSentEvents', () => {
  it('reads the user sends from the sender in chunks of the logs range', async () => {
    const seen: LogsRequest[] = [];
    const { l2Stake } = createModule(CHAINS.Base, {
      logsBlockRange: 20_000,
      blockNumber: 50_000n,
      logs: (request) => {
        seen.push(request);
        return request.fromBlock <= 10n ? [slowStakeLog(MESSAGE_ID, 10n)] : [];
      },
    });
    const sent = await l2Stake.getSlowStakeSentEvents({
      account: ACCOUNT,
      fromBlock: 0n,
    });
    expect(sent).toEqual([
      {
        ...SENT,
        user: getAddress(ACCOUNT),
        token: getAddress(WETH),
        sendBlockNumber: 10n,
      },
    ]);
    expect(seen.map(({ fromBlock, toBlock }) => [fromBlock, toBlock])).toEqual([
      [0n, 19_999n],
      [20_000n, 39_999n],
      [40_000n, 50_000n],
    ]);
    expect(seen[0]).toMatchObject({
      address: SENDER,
      event: expect.objectContaining({ name: 'SlowStake' }),
      args: { user: ACCOUNT },
    });
  });

  it('wraps an L2 read failure', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      logs: () => {
        throw new Error('rpc down');
      },
    });
    await expect(
      l2Stake.getSlowStakeSentEvents({ account: ACCOUNT, fromBlock: 0n }),
    ).rejects.toMatchObject({ name: 'L2SlowStakeLookupError', source: 'l2' });
  });
});

describe('getSlowStakeStatus', () => {
  it('is sent while the API does not list the message', async () => {
    const { l2Stake } = createModule(CHAINS.Base, { fetcher: ccipApi({}) });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toEqual({
      ...SENT,
      stage: 'sent',
      ccipExplorerUrl: `https://ccip.chain.link/msg/${MESSAGE_ID}`,
    });
  });

  it('is in transit until CCIP executes it', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({ [MESSAGE_ID]: ccipMessage('COMMITTED') }),
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
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
      stage: 'transport_failed',
      readyForManualExecution: true,
    });
  });

  it('needs an L1 client once the message executed', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
      }),
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).rejects.toMatchObject({
      code: ERROR_CODE.NOT_SUPPORTED,
    });
  });

  it('reads the stake and the handover from the L1 receipt: staked', async () => {
    const { l2Stake, l1PublicClient } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
      }),
      l1: l1Stub(),
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      stage: 'staked',
      l1TxHash: L1_TX,
      l1BlockNumber: L1_BLOCK,
      stakedAmount: STAKED,
      bridgeMessageId: undefined,
    });
    expect(l1PublicClient?.getTransactionReceipt).toHaveBeenCalledWith({
      hash: L1_TX,
    });
  });

  it('is delivered once the wstETH is minted to the user on the L2', async () => {
    const { l2Stake, publicClient } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
      }),
      l1: l1Stub(),
      blockNumber: SEND_BLOCK + 1000n,
      logs: ({ address }) =>
        address === L2_WSTETH ? [mintLog(STAKED, SEND_BLOCK + 900n)] : [],
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      stage: 'delivered',
      stakedAmount: STAKED,
      l2TxHash: L2_MINT_TX,
    });
    expect(publicClient.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        address: L2_WSTETH,
        args: { from: zeroAddress, to: ACCOUNT },
        fromBlock: SEND_BLOCK,
      }),
    );
  });

  it('does not take a mint of another amount for the delivery', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
      }),
      l1: l1Stub(),
      logs: ({ address }) =>
        address === L2_WSTETH ? [mintLog(STAKED + 1n, SEND_BLOCK + 900n)] : [],
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      stage: 'staked',
    });
  });

  it('is parked while the receiver holds the failed message', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
      }),
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
    expect(status).toMatchObject({ stage: 'parked', l1TxHash: L1_TX });
    if (status.stage !== 'parked') throw new Error('not parked');
    expect(status.failedMessage).toEqual(FAILED_MESSAGE);
    // the retry carries the message the receiver stored
    const retry = await l2Stake.retryFailedMessagePopulateTx(
      status.failedMessage,
    );
    expect(retry.to).toBe(L1_RECEIVER);
    expect(retry.data.startsWith('0x')).toBe(true);
  });

  it('is tokens recovered when the DAO moved the parked funds out', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
      }),
      l1: l1Stub({
        receipts: { [L1_TX]: l1Receipt('failed') },
        logs: ({ event }) =>
          event?.name === 'TokensRecovered'
            ? [
                eventLog(
                  L1_STAKING_RECEIVER_ABI,
                  'TokensRecovered',
                  { messageId: MESSAGE_ID },
                  L1_RECEIVER,
                  { transactionHash: RETRY_TX, blockNumber: L1_BLOCK + 5n },
                ),
              ]
            : [],
      }),
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      stage: 'tokens_recovered',
      l1TxHash: RETRY_TX,
    });
  });

  it('follows a retried stake into the retry receipt', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
      }),
      l1: l1Stub({
        receipts: {
          [L1_TX]: l1Receipt('failed'),
          [RETRY_TX]: l1Receipt('recovered', {
            txHash: RETRY_TX,
            blockNumber: L1_BLOCK + 5n,
          }),
        },
        logs: ({ event }) =>
          event?.name === 'MessageRecovered'
            ? [
                eventLog(
                  L1_STAKING_RECEIVER_ABI,
                  'MessageRecovered',
                  { messageId: MESSAGE_ID },
                  L1_RECEIVER,
                  { transactionHash: RETRY_TX, blockNumber: L1_BLOCK + 5n },
                ),
              ]
            : [],
      }),
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).resolves.toMatchObject({
      stage: 'staked',
      l1TxHash: RETRY_TX,
      stakedAmount: STAKED,
    });
  });

  it('fails the lookup when the slot is clear but no recovery is found', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
      }),
      l1: l1Stub({ receipts: { [L1_TX]: l1Receipt('failed') } }),
    });
    await expect(l2Stake.getSlowStakeStatus(SENT)).rejects.toMatchObject({
      name: 'L2SlowStakeLookupError',
      source: 'l1',
      messageId: MESSAGE_ID,
    });
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
});

describe('getSlowStakeStatuses', () => {
  it('claims the mints in send order, one per stake', async () => {
    const { l2Stake } = createModule(CHAINS.Base, {
      fetcher: ccipApi({
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
        [OTHER_MESSAGE_ID]: ccipMessage('SUCCESS', {
          messageId: OTHER_MESSAGE_ID,
          receiptTransactionHash: RETRY_TX,
        }),
      }),
      l1: l1Stub({
        receipts: {
          [L1_TX]: l1Receipt('succeeded'),
          [RETRY_TX]: l1Receipt('succeeded', {
            messageId: OTHER_MESSAGE_ID,
            txHash: RETRY_TX,
          }),
        },
      }),
      blockNumber: SEND_BLOCK + 2000n,
      logs: ({ address }) => {
        if (address === SENDER)
          return [
            slowStakeLog(MESSAGE_ID, SEND_BLOCK),
            slowStakeLog(OTHER_MESSAGE_ID, SEND_BLOCK + 100n),
          ];
        if (address === L2_WSTETH) return [mintLog(STAKED, SEND_BLOCK + 900n)];
        return [];
      },
    });
    const statuses = await l2Stake.getSlowStakeStatuses({
      account: ACCOUNT,
      fromBlock: SEND_BLOCK,
    });
    expect(statuses.map((status) => status.stage)).toEqual([
      'delivered',
      'staked',
    ]);
  });

  it('is empty for a user without sends', async () => {
    const { l2Stake, publicClient } = createModule();
    await expect(
      l2Stake.getSlowStakeStatuses({ account: ACCOUNT, fromBlock: 0n }),
    ).resolves.toEqual([]);
    // no mint lookup without a send to match
    expect(publicClient.getLogs).toHaveBeenCalledTimes(1);
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
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
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

  it('resolves statuses without fetching a message twice', async () => {
    const fetcher = ccipApi(
      {
        [MESSAGE_ID]: ccipMessage('SUCCESS', { receiptTransactionHash: L1_TX }),
      },
      {
        first: {
          data: [summary(MESSAGE_ID, ACCOUNT)],
          pagination: { limit: 100, hasNextPage: false, cursor: null },
        },
      },
    );
    const { l2Stake } = createModule(CHAINS.Base, { fetcher, l1: l1Stub() });
    const statuses = await l2Stake.getSlowStakeStatusesFromCcipApi({
      account: ACCOUNT,
    });
    expect(statuses.map((s) => s.stage)).toEqual(['staked']);
    // one list page, one message
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
