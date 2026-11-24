import { ZodError } from 'zod';

import {
  TRANSACTIONS_PAGE_SIZE,
  fetchTransactions,
  isValidCursor,
  parseTransactionsResponse,
} from '../transactions';

vi.mock('../../fetchApiWrapper', () => ({
  responseTimeExternalMetricWrapper: ({
    request,
  }: {
    request: () => unknown;
  }) => request(),
}));

const WALLET = '0x463b874e293da72d6fe354c1ed2f64acb473bb04';
const OTHER = '0x1111111111111111111111111111111111111111';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
const WSTETH = '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0';
const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

type Transfer = Record<string, unknown>;

const transfer = (overrides: Transfer = {}): Transfer => ({
  direction: 'out',
  sender_address: WALLET,
  recipient_address: OTHER,
  token: { name: 'USD Coin', symbol: 'USDC', address: USDC },
  decimals: 6,
  amount_string: '100000000',
  amount: 100,
  value_usd: 100,
  ...overrides,
});

const tx = (overrides: Record<string, unknown> = {}) => ({
  type: 'send',
  hash: '0xabc',
  timestamp: 1_700_000_000_000,
  status: 'confirmed',
  chain_id: 'ethereum',
  chain_name: 'Ethereum',
  chain_id_numeric: 1,
  sender_address: WALLET,
  recipient_address: OTHER,
  defi: null,
  transfers: [transfer()],
  attributes: { is_trash: false },
  ...overrides,
});

const parse = (...rows: unknown[]) =>
  parseTransactionsResponse({ data: rows, next_page_token: 'next' }, WALLET);

describe('parseTransactionsResponse', () => {
  it('maps a send with its counterparty and cursor', () => {
    const { transactions, nextCursor } = parse(tx());
    expect(nextCursor).toBe('next');
    expect(transactions[0]).toMatchObject({
      id: 'ethereum:0xabc',
      type: 'send',
      product: null,
      counterparty: OTHER,
      transfers: [
        { direction: 'out', symbol: 'USDC', tokenAddress: USDC, amount: 100 },
      ],
    });
  });

  it('drops approvals, failed and trash transactions', () => {
    expect(
      parse(
        tx({ type: 'approve' }),
        tx({ status: 'failed' }),
        tx({ attributes: { is_trash: true } }),
      ).transactions,
    ).toEqual([]);
  });

  it('drops spam airdrops: unpriced receives and link-like tokens', () => {
    const spam = transfer({
      direction: 'in',
      token: { name: 'airdrop', symbol: 'www.poks.top', address: OTHER },
      value_usd: null,
    });
    const unpriced = transfer({ direction: 'in', value_usd: null });
    expect(
      parse(
        tx({ type: 'receive', transfers: [spam] }),
        tx({ type: 'receive', transfers: [unpriced] }),
      ).transactions,
    ).toEqual([]);
  });

  it('names ETH to stETH a stake through Staking', () => {
    const [stake] = parse(
      tx({
        type: 'trade',
        recipient_address: STETH,
        transfers: [
          transfer({
            token: { symbol: 'ETH', name: 'Ether', address: NATIVE },
          }),
          transfer({
            direction: 'in',
            token: { symbol: 'stETH', name: 'stETH', address: STETH },
          }),
        ],
      }),
    ).transactions;
    expect(stake).toMatchObject({ type: 'stake', product: 'Staking' });
    expect(stake.transfers[0].tokenAddress).toBeNull();
  });

  it('puts what left the wallet first, whatever the API order', () => {
    const [stake] = parse(
      tx({
        type: 'trade',
        recipient_address: STETH,
        transfers: [
          transfer({
            direction: 'in',
            token: { symbol: 'stETH', name: 'stETH', address: STETH },
          }),
          transfer({
            token: { symbol: 'ETH', name: 'Ether', address: NATIVE },
          }),
        ],
      }),
    ).transactions;
    expect(stake.transfers.map((t) => t.symbol)).toEqual(['ETH', 'stETH']);
    expect(stake.type).toBe('stake');
  });

  it('names a deposit into an Earn vault by the vault', () => {
    const earnUsd = '0x4ce1ac8f43e0e5bd7a346a98af777bf8fbea1981';
    const [deposit] = parse(
      tx({
        type: 'trade',
        defi: { name: 'usd-coin' },
        transfers: [
          transfer(),
          transfer({
            direction: 'in',
            token: { symbol: 'earnUSD', name: 'earnUSD', address: earnUsd },
            value_usd: null,
          }),
        ],
      }),
    ).transactions;
    expect(deposit).toMatchObject({ type: 'deposit', product: 'EarnUSD' });
  });

  it('keeps a DEX swap of ETH to stETH a swap', () => {
    const [swap] = parse(
      tx({
        type: 'trade',
        recipient_address: OTHER,
        transfers: [
          transfer({
            token: { symbol: 'ETH', name: 'Ether', address: NATIVE },
          }),
          transfer({
            direction: 'in',
            token: { symbol: 'stETH', name: 'stETH', address: STETH },
          }),
        ],
      }),
    ).transactions;
    expect(swap).toMatchObject({ type: 'swap', product: null });
  });

  it('keeps a plain transfer of vault shares a send', () => {
    const earnUsd = '0x4ce1ac8f43e0e5bd7a346a98af777bf8fbea1981';
    const [send] = parse(
      tx({
        transfers: [
          transfer({
            token: { symbol: 'earnUSD', name: 'earnUSD', address: earnUsd },
          }),
        ],
      }),
    ).transactions;
    expect(send).toMatchObject({ type: 'send', product: null });
  });

  it('drops dust receives used for address poisoning', () => {
    const dust = transfer({ direction: 'in', value_usd: 0.0001 });
    expect(
      parse(tx({ type: 'receive', transfers: [dust] })).transactions,
    ).toEqual([]);
  });

  it('keeps small receives of Lido tokens on Ethereum', () => {
    const wsteth = transfer({
      direction: 'in',
      token: {
        name: 'Wrapped liquid staked Ether 2.0',
        symbol: 'wstETH',
        address: WSTETH,
      },
      amount: 0.0000855,
      value_usd: 0.38,
    });
    const [receive] = parse(
      tx({ type: 'receive', transfers: [wsteth] }),
    ).transactions;
    expect(receive).toMatchObject({ type: 'receive' });
  });

  it('drops small Lido-token receives off Ethereum and trash', () => {
    const steth = transfer({
      direction: 'in',
      token: {
        name: 'Liquid staked Ether 2.0',
        symbol: 'stETH',
        address: STETH,
      },
      value_usd: 0.1,
    });
    expect(
      parse(
        tx({ type: 'receive', chain_id_numeric: 10, transfers: [steth] }),
        tx({
          type: 'receive',
          transfers: [steth],
          attributes: { is_trash: true },
        }),
      ).transactions,
    ).toEqual([]);
  });

  it('drops a dust receive mixing a Lido token with another one', () => {
    const steth = transfer({
      direction: 'in',
      token: {
        name: 'Liquid staked Ether 2.0',
        symbol: 'stETH',
        address: STETH,
      },
      value_usd: 0.1,
    });
    const dust = transfer({ direction: 'in', value_usd: 0.0001 });
    expect(
      parse(tx({ type: 'receive', transfers: [steth, dust] })).transactions,
    ).toEqual([]);
  });

  it('keeps a legit token name with a dot', () => {
    const [send] = parse(
      tx({
        transfers: [
          transfer({
            token: { symbol: 'CRO', name: 'Crypto.com Coin', address: OTHER },
          }),
        ],
      }),
    ).transactions;
    expect(send?.transfers[0].name).toBe('Crypto.com Coin');
  });

  it('names stETH sent to the withdrawal queue a withdrawal request', () => {
    const queue = '0x889edc2edab5f40e902b864ad4d7ade8e412f9b1';
    const [request] = parse(
      tx({
        type: 'trade',
        recipient_address: queue,
        defi: { name: 'lido' },
        transfers: [
          transfer({
            recipient_address: queue,
            token: { symbol: 'stETH', name: 'stETH', address: STETH },
          }),
        ],
      }),
    ).transactions;
    expect(request).toMatchObject({
      type: 'withdrawalRequest',
      product: 'Staking',
    });
  });

  it('names ETH from the withdrawal queue a withdrawal claim', () => {
    const queue = '0x889edc2edab5f40e902b864ad4d7ade8e412f9b1';
    const [claim] = parse(
      tx({
        type: 'withdraw',
        recipient_address: queue,
        transfers: [
          transfer({
            direction: 'in',
            sender_address: queue,
            token: { symbol: 'ETH', name: 'Ether', address: NATIVE },
          }),
        ],
      }),
    ).transactions;
    expect(claim).toMatchObject({
      type: 'withdrawalClaim',
      product: 'Staking',
    });
  });

  it('turns a one-sided trade into a plain send to the contract', () => {
    const contract = '0x9caa80709b4f9a72b70efc7db4be0150bf362126';
    const [send] = parse(
      tx({
        type: 'trade',
        recipient_address: contract,
        transfers: [
          transfer({
            recipient_address: contract,
            token: { symbol: 'stETH', name: 'stETH', address: STETH },
          }),
        ],
      }),
    ).transactions;
    expect(send).toMatchObject({ type: 'send', counterparty: contract });
  });

  it('never shows an API app id as a product', () => {
    const [swap] = parse(
      tx({
        type: 'trade',
        defi: { name: 'compound-governance-token' },
        transfers: [
          transfer(),
          transfer({
            direction: 'in',
            token: { symbol: 'USDT', name: 'Tether', address: OTHER },
          }),
        ],
      }),
    ).transactions;
    expect(swap).toMatchObject({ type: 'swap', product: null });
  });

  it('skips invalid rows and throws on a broken payload', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(parse({ broken: true }, tx()).transactions).toHaveLength(1);
    expect(() => parseTransactionsResponse({}, WALLET)).toThrow(ZodError);
  });
});

describe('isValidCursor', () => {
  it.each(['abc', 'eyJhIjoxfQ==', 'a:b-c_d.e/f+g'])('accepts %s', (cursor) => {
    expect(isValidCursor(cursor)).toBe(true);
  });

  it.each(['', '<script>', 'a b', 'x'.repeat(513)])('rejects %j', (cursor) => {
    expect(isValidCursor(cursor)).toBe(false);
  });
});

describe('fetchTransactions', () => {
  it('reads a page by cursor', async () => {
    const get = vi.fn().mockResolvedValue({ data: [], next_page_token: null });
    await fetchTransactions({ post: vi.fn(), get }, WALLET, 'abc');
    const [path, timeout] = get.mock.calls[0];
    expect(path).toBe(
      `/api/v2/transactions/${WALLET}/history?limit=${TRANSACTIONS_PAGE_SIZE}&page_token=abc`,
    );
    expect(timeout).toBeGreaterThan(0);
  });
});

describe('fetchTransactions paging', () => {
  it('asks for the largest portion', () => {
    expect(TRANSACTIONS_PAGE_SIZE).toBe(200);
  });

  describe('address poisoning', () => {
    const STRANGER = '0x138c9efe98d5ae74e2fc044f2554f1df32b03ca4';
    const FAKE_TOKEN = '0x9779857b74e33206b05efbf7911910f7a4265cd4';
    const fake = (token: Record<string, unknown>) =>
      transfer({ token: { address: FAKE_TOKEN, ...token }, value_usd: null });

    it('hides a priceless token sent "from" the wallet by a stranger', () => {
      const { transactions } = parse(
        tx({
          sender_address: STRANGER,
          transfers: [fake({ name: 'Tether USD', symbol: 'USDT' })],
        }),
      );
      expect(transactions).toEqual([]);
    });

    it('hides a priceless token with look-alike letters', () => {
      const { transactions } = parse(
        tx({
          transfers: [
            fake({ name: '\u222A\u054F\u216E\u0422', symbol: 'USDT' }),
          ],
        }),
        tx({
          hash: '0xdef',
          transfers: [
            fake({ name: 'Tether', symbol: '\u054D\u054F\u018A\uA4D4' }),
          ],
        }),
      );
      expect(transactions).toEqual([]);
    });

    it('keeps a priced transfer in a transaction a relayer sent', () => {
      const { transactions } = parse(tx({ sender_address: STRANGER }));
      expect(transactions).toHaveLength(1);
    });

    it('keeps the wallet own send of a priceless token', () => {
      const { transactions } = parse(
        tx({ transfers: [fake({ name: 'New Token', symbol: 'NEW' })] }),
      );
      expect(transactions).toHaveLength(1);
    });

    it('keeps a priceless token a stranger sent to the wallet', () => {
      // an incoming one is judged by the dust rule instead
      const { transactions } = parse(
        tx({
          type: 'trade',
          sender_address: STRANGER,
          transfers: [
            transfer(),
            transfer({
              direction: 'in',
              token: { name: 'New Token', symbol: 'NEW', address: FAKE_TOKEN },
              value_usd: null,
            }),
          ],
        }),
      );
      expect(transactions[0].transfers).toHaveLength(2);
    });
  });

  it('drops a counterparty that is not an address', () => {
    const { transactions } = parse(
      tx({
        recipient_address: 'not-an-address',
        transfers: [transfer({ recipient_address: 'not-an-address' })],
      }),
    );
    expect(transactions[0].counterparty).toBeNull();
  });

  it('skips a row with an oversized string', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { transactions } = parse(
      tx({ transfers: [transfer({ sender_address: 'a'.repeat(65) })] }),
      tx({ hash: '0xdef' }),
    );
    warn.mockRestore();
    expect(transactions.map(({ hash }) => hash)).toEqual(['0xdef']);
  });

  it('ends the list on a cursor the route would not take back', () => {
    const { nextCursor } = parseTransactionsResponse(
      { data: [], next_page_token: 'bad cursor\n' },
      WALLET,
    );
    expect(nextCursor).toBeNull();
  });

  it('makes one upstream call even when filtering empties the page', async () => {
    const get = vi.fn().mockResolvedValue({
      data: [tx({ attributes: { is_trash: true } })],
      next_page_token: 'more',
    });
    const result = await fetchTransactions(
      { post: vi.fn(), get },
      WALLET,
      null,
    );
    expect(get).toHaveBeenCalledTimes(1);
    expect(result.transactions).toEqual([]);
    // the client reads on from here
    expect(result.nextCursor).toBe('more');
  });
});
