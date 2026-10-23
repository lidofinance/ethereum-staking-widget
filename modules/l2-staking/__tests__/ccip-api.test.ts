import type { Hash } from 'viem';
import {
  CcipApiClient,
  CcipApiError,
  CCIP_API_DEFAULT_BASE_URL,
  ccipMessageSchema,
  ccipMessageListSchema,
  getCcipExplorerMessageUrl,
} from '../utils/ccip-api';

const MESSAGE_ID: Hash =
  '0xf50ff3791ba99db683b51a711436712b130ace8cb0f42789850b5f3cdc56cd5e';

// the API's answer for the rundown's worked example, trimmed to the fields
// the pipeline reads plus a few it ignores
const SAMPLE = {
  messageId: MESSAGE_ID,
  sequenceNumber: '1515',
  origin: '0x82A5d2E9A84b1347Ef311f0b71ABdD47A8849521',
  sourceNetworkInfo: { chainSelector: '3734403246176062136', chainId: '10' },
  destNetworkInfo: { chainSelector: '5009297550715157269', chainId: '1' },
  sender: '0x328de900860816d29D1367F6903a24D8ed40C997',
  receiver: '0x6F357d53d6bE3238180316BA5F8f11467e164588',
  status: 'SUCCESS',
  sendTransactionHash:
    '0x3435a1409eafa7a896e7ac3b3222d5d5379373d412a480e3463f358217ab075e',
  sendBlockNumber: 155730938,
  sendTimestamp: '2026-08-18T13:44:13.000Z',
  tokenAmounts: [
    {
      destTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '1000000000000',
    },
  ],
  readyForManualExecution: false,
  receiptTransactionHash:
    '0x1d623b407783ea0023ba18673b39688383a7028fdc8d43d855553b46eba971c6',
  receiptBlockNumber: 25782450,
  data: '0x82a5d2e9a84b1347ef311f0b71abdd47a8849521000000000000000000000000000000000000000000000000000000e8d4a5100000000000000000000000000000000000000003d090',
  version: '1.5.0',
};

const respond = (body: unknown, status = 200) =>
  vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
  );

describe('ccip api urls', () => {
  it('builds the message url under the default base', () => {
    expect(new CcipApiClient().getMessageUrl(MESSAGE_ID)).toBe(
      `${CCIP_API_DEFAULT_BASE_URL}/v2/messages/${MESSAGE_ID}`,
    );
  });

  it('keeps a base path and encodes the segment', () => {
    const client = new CcipApiClient({ baseUrl: 'https://proxy.test/ccip/' });
    expect(client.getMessageUrl(MESSAGE_ID)).toBe(
      `https://proxy.test/ccip/v2/messages/${MESSAGE_ID}`,
    );
    expect(client.getMessageUrl('0x/../x')).toBe(
      'https://proxy.test/ccip/v2/messages/0x%2F..%2Fx',
    );
  });

  it('links to the explorer by message id', () => {
    expect(getCcipExplorerMessageUrl(MESSAGE_ID)).toBe(
      `https://ccip.chain.link/msg/${MESSAGE_ID}`,
    );
  });
});

const SUMMARY = {
  messageId: MESSAGE_ID,
  sender: '0x328de900860816d29D1367F6903a24D8ed40C997',
  receiver: '0x6F357d53d6bE3238180316BA5F8f11467e164588',
  origin: '0x82A5d2E9A84b1347Ef311f0b71ABdD47A8849521',
  status: 'SUCCESS',
  readyForManualExecution: false,
  sourceNetworkInfo: { chainSelector: '15971525489660198786', chainId: '8453' },
  destNetworkInfo: { chainSelector: '5009297550715157269', chainId: '1' },
  sendTransactionHash:
    '0xadf0b8476f8d35dc565c429d54a06cc554489fb01513eb2540dccfc8b5c0c735',
  sendTimestamp: '2026-10-20T23:30:13.000Z',
  receiptTransactionHash: null,
  sourceTokenAmount: {
    tokenAddress: '0x4200000000000000000000000000000000000006',
    tokenAmount: '1',
  },
  hasData: true,
};

describe('ccip api message list', () => {
  it('builds the list url from the filters that are set, selectors as decimals', () => {
    const client = new CcipApiClient();
    expect(
      client.getMessagesUrl({
        sender: '0x328de900860816d29D1367F6903a24D8ed40C997',
        sourceChainSelector: 15971525489660198786n,
        destChainSelector: 5009297550715157269n,
        limit: 50,
      }),
    ).toBe(
      `${CCIP_API_DEFAULT_BASE_URL}/v2/messages?sender=0x328de900860816d29D1367F6903a24D8ed40C997&sourceChainSelector=15971525489660198786&destChainSelector=5009297550715157269&limit=50`,
    );
    expect(client.getMessagesUrl({})).toBe(
      `${CCIP_API_DEFAULT_BASE_URL}/v2/messages`,
    );
  });

  it('parses a page with its cursor', () => {
    const page = ccipMessageListSchema.parse({
      data: [SUMMARY],
      pagination: {
        limit: 100,
        hasNextPage: true,
        cursor: 'abc',
        totalCount: 99,
        isCountCapped: false,
      },
    });
    expect(page.data[0]?.origin).toBe(SUMMARY.origin);
    expect(page.pagination.cursor).toBe('abc');
  });

  it('fetches a page and passes the cursor on', async () => {
    const fetcher = respond({
      data: [SUMMARY],
      pagination: { limit: 1, hasNextPage: false, cursor: null },
    });
    const client = new CcipApiClient({ fetcher });
    const page = await client.listMessages({ limit: 1, cursor: 'c1' });
    expect(page.data).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledWith(
      `${CCIP_API_DEFAULT_BASE_URL}/v2/messages?limit=1&cursor=c1`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('fails a list request on a server error', async () => {
    const client = new CcipApiClient({ fetcher: respond({}, 500) });
    await expect(client.listMessages({})).rejects.toMatchObject({
      name: 'CcipApiError',
      status: 500,
    });
  });
});

describe('ccipMessageSchema', () => {
  it('parses the API answer into typed fields', () => {
    const message = ccipMessageSchema.parse(SAMPLE);
    expect(message.sourceNetworkInfo).toEqual({
      chainSelector: 3734403246176062136n,
      chainId: 10,
    });
    expect(message.tokenAmounts[0]?.amount).toBe(1_000_000_000_000n);
    expect(message.receiptBlockNumber).toBe(25782450);
  });

  it('tolerates a message not executed yet', () => {
    const { receiptTransactionHash, receiptBlockNumber, ...pending } = SAMPLE;
    const message = ccipMessageSchema.parse({
      ...pending,
      status: 'COMMITTED',
    });
    expect(message.receiptTransactionHash).toBeUndefined();
    expect(message.readyForManualExecution).toBe(false);
  });
});

describe('CcipApiClient.getMessage', () => {
  it('returns the parsed message', async () => {
    const fetcher = respond(SAMPLE);
    const client = new CcipApiClient({ fetcher });
    const message = await client.getMessage(MESSAGE_ID);
    expect(message?.status).toBe('SUCCESS');
    expect(fetcher).toHaveBeenCalledWith(
      client.getMessageUrl(MESSAGE_ID),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('returns null for a message the API does not know', async () => {
    const client = new CcipApiClient({
      fetcher: respond({ error: 'NOT_FOUND' }, 404),
    });
    await expect(client.getMessage(MESSAGE_ID)).resolves.toBeNull();
  });

  it('fails on a server error with the status', async () => {
    const client = new CcipApiClient({ fetcher: respond({}, 503) });
    await expect(client.getMessage(MESSAGE_ID)).rejects.toMatchObject({
      name: 'CcipApiError',
      status: 503,
    });
  });

  it('fails on an unexpected shape', async () => {
    const client = new CcipApiClient({
      fetcher: respond({ ...SAMPLE, sendBlockNumber: 'soon' }),
    });
    await expect(client.getMessage(MESSAGE_ID)).rejects.toBeInstanceOf(
      CcipApiError,
    );
  });

  it('fails when unreachable', async () => {
    const client = new CcipApiClient({
      fetcher: vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    });
    await expect(client.getMessage(MESSAGE_ID)).rejects.toMatchObject({
      name: 'CcipApiError',
      message: 'CCIP API is unreachable',
    });
  });
});
