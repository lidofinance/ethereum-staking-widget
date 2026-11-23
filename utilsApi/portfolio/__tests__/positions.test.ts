import { ZodError } from 'zod';

import {
  LIDO_TOKEN_ADDRESSES,
  fetchPositions,
  parsePositionsResponse,
  positionRowToPortfolioToken,
  withdrawalRowToPortfolioTokens,
  tokenRowToPortfolioToken,
} from '../positions';

const LIDO_ADDRESS = [...LIDO_TOKEN_ADDRESSES][0];
const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
const NATIVE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

type RowOverrides = {
  id?: string;
  chain_id_numeric?: number | null;
  value_usd?: number | null;
  attributes?: Record<string, unknown>;
};

const makeRow = ({ attributes, ...rest }: RowOverrides = {}) => ({
  type: 'token' as const,
  id: 'row-1',
  chain_id: 'ethereum',
  chain_id_numeric: 1,
  chain_name: 'Ethereum',
  value_usd: 100,
  ...rest,
  attributes: {
    category: 'wallet',
    position_id: 'Pos-1',
    token_symbol: 'ABC',
    token_name: 'Abc Token',
    contract_address: '0x1111111111111111111111111111111111111111',
    decimals: 18,
    amount_string: '1000000000000000000',
    amount: 1,
    price_usd: 100,
    is_spam: false,
    value_incomplete: false,
    ...attributes,
  },
});

const parseRow = (overrides: RowOverrides) =>
  parsePositionsResponse({ positions: [makeRow(overrides)] }).tokens;

describe('LIDO_TOKEN_ADDRESSES', () => {
  it('is a non-empty set of lowercase addresses', () => {
    expect(LIDO_TOKEN_ADDRESSES.size).toBeGreaterThan(0);
    for (const a of LIDO_TOKEN_ADDRESSES) expect(a).toBe(a.toLowerCase());
  });
});

describe('tokenRowToPortfolioToken filtering', () => {
  const parsed = (o: RowOverrides) => tokenRowToPortfolioToken(makeRow(o));

  it('drops spam', () => {
    expect(parsed({ attributes: { is_spam: true } })).toBeNull();
  });

  it.each([0, -1])('drops amount %s', (amount) => {
    expect(parsed({ attributes: { amount } })).toBeNull();
  });

  it.each([null, '', '   '])('drops empty symbol %j', (token_symbol) => {
    expect(parsed({ attributes: { token_symbol } })).toBeNull();
  });

  it.each([
    ['symbol with a url', { token_symbol: 'visit https://x' }],
    ['symbol with www', { token_symbol: 'www.x' }],
    ['symbol that is a domain', { token_symbol: 'claim.xyz' }],
    ['name with a url', { token_name: 'Claim at https://foo.io' }],
    ['name with www', { token_name: 'Get rewards at www.foo.io' }],
  ])('drops %s', (_l, attributes) => {
    expect(parsed({ attributes })).toBeNull();
  });

  it.each([
    'ether.fi ETH',
    'ether.fi governance token',
    'Curve.fi DAI/USDC/USDT',
    'yearn.finance',
    'Reserve.org',
  ])('keeps a legit name with a dot: %s', (token_name) => {
    expect(parsed({ attributes: { token_name } })).not.toBeNull();
  });

  it('drops non-spam dust below $1', () => {
    expect(
      parsed({ value_usd: 0.15, attributes: { is_spam: false } }),
    ).toBeNull();
  });

  it('keeps Lido tokens at any value', () => {
    expect(
      parsed({
        value_usd: 0.01,
        attributes: { contract_address: LIDO_ADDRESS },
      }),
    ).not.toBeNull();
  });

  it.each([null, undefined])(
    'unclassified (%s) kept when value >= 1',
    (is_spam) => {
      expect(parsed({ value_usd: 1, attributes: { is_spam } })).not.toBeNull();
    },
  );

  it('unclassified dropped when value < 1', () => {
    expect(
      parsed({ value_usd: 0.99, attributes: { is_spam: null } }),
    ).toBeNull();
  });

  it('unclassified dropped when value null', () => {
    expect(
      parsed({ value_usd: null, attributes: { is_spam: null } }),
    ).toBeNull();
  });

  it('unclassified dropped when value_incomplete', () => {
    expect(
      parsed({
        value_usd: 500,
        attributes: { is_spam: null, value_incomplete: true },
      }),
    ).toBeNull();
  });
});

describe('tokenRowToPortfolioToken mapping', () => {
  it('maps fields and pnl key', () => {
    const [token] = parseRow({});
    expect(token).toEqual({
      id: 'row-1',
      chainId: 1,
      chainSlug: 'ethereum',
      chainName: 'Ethereum',
      address: '0x1111111111111111111111111111111111111111',
      isNative: false,
      symbol: 'ABC',
      name: 'Abc Token',
      decimals: 18,
      amountRaw: '1000000000000000000',
      amount: 1,
      priceUsd: 100,
      valueUsd: 100,
      isLido: false,
      pnl: { category: 'wallet', positionId: 'Pos-1' },
    });
  });

  it.each(['1.5', '0x10', ' 1', ''])(
    'passes no raw amount for %j, the float amount stays',
    (amountString) => {
      const [token] = parseRow({ attributes: { amount_string: amountString } });
      expect(token.amountRaw).toBe('');
      expect(token.amount).toBe(1);
    },
  );

  it('normalises native address to null and marks it native', () => {
    const [native] = parseRow({ attributes: { contract_address: NATIVE } });
    expect(native.address).toBeNull();
    expect(native.isNative).toBe(true);
  });

  it('lowercases address', () => {
    const [t] = parseRow({
      attributes: {
        contract_address: '0xAAAAaaaaAAAAaaaaAAAAaaaaAAAAaaaaAAAAaaaa',
      },
    });
    expect(t.address).toBe('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  });

  it('null address when missing', () => {
    expect(
      parseRow({ attributes: { contract_address: null } })[0].address,
    ).toBeNull();
  });

  it('truncates symbol to 16 and name to 48', () => {
    const [t] = parseRow({
      attributes: { token_symbol: 'S'.repeat(40), token_name: 'N'.repeat(100) },
    });
    expect(t.symbol).toHaveLength(16);
    expect(t.name).toHaveLength(48);
  });

  it('falls back to symbol when name empty', () => {
    expect(parseRow({ attributes: { token_name: '' } })[0].name).toBe('ABC');
  });

  it('pnl null without category or position_id', () => {
    expect(parseRow({ attributes: { category: null } })[0].pnl).toBeNull();
    expect(parseRow({ attributes: { position_id: null } })[0].pnl).toBeNull();
  });

  it('valueUsd null and chainId null when absent', () => {
    const [t] = parseRow({
      value_usd: null,
      chain_id_numeric: null,
      attributes: { contract_address: LIDO_ADDRESS },
    });
    // without a chain id it is not Lido, so dust rules drop it
    expect(t).toBeUndefined();
    const [lido] = parseRow({
      value_usd: null,
      attributes: { contract_address: LIDO_ADDRESS },
    });
    expect(lido.valueUsd).toBeNull();
  });

  it('chainId null when absent', () => {
    const [t] = parseRow({ chain_id_numeric: null });
    expect(t.chainId).toBeNull();
  });
});

describe('isLido', () => {
  it('true for chain 1 + lido address (case-insensitive)', () => {
    const [t] = parseRow({
      attributes: {
        contract_address: LIDO_ADDRESS.toUpperCase().replace('0X', '0x'),
      },
    });
    expect(t.isLido).toBe(true);
  });

  it('false on other chain', () => {
    const [t] = parseRow({
      chain_id_numeric: 8453,
      attributes: { contract_address: LIDO_ADDRESS },
    });
    expect(t.isLido).toBe(false);
  });

  it('false when chain id missing', () => {
    const [t] = parseRow({
      chain_id_numeric: null,
      attributes: { contract_address: LIDO_ADDRESS },
    });
    expect(t.isLido).toBe(false);
  });
});

describe('parsePositionsResponse', () => {
  it('sorts by valueUsd desc', () => {
    const { tokens } = parsePositionsResponse({
      positions: [
        makeRow({ id: 'a', value_usd: 5 }),
        makeRow({ id: 'b', value_usd: 500 }),
        makeRow({ id: 'c', value_usd: 50 }),
      ],
    });
    expect(tokens.map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('skips invalid rows', () => {
    const { tokens } = parsePositionsResponse({
      positions: [{ foo: 'bar' }, null, makeRow({ id: 'ok' })],
    });
    expect(tokens.map((t) => t.id)).toEqual(['ok']);
  });

  it('dataIncomplete defaults to false and passes through', () => {
    expect(parsePositionsResponse({ positions: [] }).dataIncomplete).toBe(
      false,
    );
    expect(
      parsePositionsResponse({ positions: [], data_incomplete: true })
        .dataIncomplete,
    ).toBe(true);
  });

  it.each([null, 'x', {}, { positions: 'no' }])(
    'throws ZodError on %j',
    (data) => {
      expect(() => parsePositionsResponse(data)).toThrow(ZodError);
    },
  );
});

describe('fetchPositions', () => {
  it('posts wallet to positions path and parses', async () => {
    const post = vi.fn().mockResolvedValue({ positions: [makeRow()] });
    const result = await fetchPositions({ post, get: vi.fn() }, '0xabc');
    expect(post).toHaveBeenCalledTimes(1);
    const [path, body, timeout] = post.mock.calls[0];
    expect(path).toBe('/api/v3/portfolio/positions');
    expect(body).toEqual({
      wallets: ['0xabc'],
      asset_type: 'ALL',
      hide_spam: true,
    });
    expect(timeout).toBeGreaterThan(0);
    expect(result.tokens).toHaveLength(1);
  });
});

type PositionOverrides = {
  id?: string;
  chain_id_numeric?: number | null;
  value_usd?: number | null;
  name?: string;
  defi_name?: string | null;
  attributes?: Record<string, unknown>;
};

const makeLeg = (overrides: Record<string, unknown> = {}) => ({
  token_symbol: 'stETH',
  token_name: 'Liquid staked Ether 2.0',
  contract_address: STETH,
  decimals: 18,
  amount_string: '2000000000000000000',
  amount: 2,
  price_usd: 3000,
  ...overrides,
});

const makePosition = ({ attributes, ...rest }: PositionOverrides = {}) => ({
  type: 'position' as const,
  id: 'pos-1',
  chain_id: 'ethereum',
  chain_id_numeric: 1,
  chain_name: 'Ethereum',
  value_usd: 6000,
  name: 'Lido stETH',
  defi_name: 'Lido',
  ...rest,
  attributes: {
    category: 'lido-steth-staking',
    position_id: STETH,
    value_incomplete: false,
    deposits: [makeLeg()],
    ...attributes,
  },
});

describe('withdrawal positions', () => {
  const QUEUE = '0x889edc2edab5f40e902b864ad4d7ade8e412f9b1';
  const makeWithdrawalLeg = (
    category: string,
    amountString: string,
    amount: number,
  ) => ({
    ...makeLeg(),
    token_symbol: 'stETH',
    amount_string: amountString,
    amount,
    price_usd: 2000,
    value_usd: amount * 2000,
    attributes: { category },
  });
  // the shape upstream sends: one position named "claimable" with both parts
  const mixedPosition = makePosition({
    id: 'withdrawal-1',
    name: 'Lido stETH withdrawal claimable',
    value_usd: 2.2,
    attributes: {
      category: 'lido-withdrawal-claimable',
      position_id: QUEUE,
      deposits: [
        makeWithdrawalLeg(
          'lido-withdrawal-claimable',
          '1000000000000000',
          0.001,
        ),
        makeWithdrawalLeg('lido-withdrawal-request', '100000000000000', 0.0001),
      ],
    },
  });

  it('gives one row per status, each with its own amount and value', () => {
    const { tokens } = parsePositionsResponse({ positions: [mixedPosition] });
    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toMatchObject({
      name: 'Ready to claim',
      symbol: 'stETH',
      amountRaw: '1000000000000000',
      amount: 0.001,
      valueUsd: 2,
      // a Lido position on the page, with no address to read on-chain
      isLido: true,
      address: null,
      pnl: null,
      // the drawer finds the request and claim operations by type
      activityTypes: ['withdrawalRequest', 'withdrawalClaim'],
    });
    expect(tokens[1]).toMatchObject({
      name: 'Withdrawal pending',
      symbol: 'stETH',
      amountRaw: '100000000000000',
      amount: 0.0001,
      // below the dust threshold, kept: it is a request in the queue
      valueUsd: 0.2,
    });
    expect(tokens[0].id).not.toBe(tokens[1].id);
  });

  it('names an Earn redeem request by its status too', () => {
    const { tokens } = parsePositionsResponse({
      positions: [
        makePosition({
          name: 'Lido redeem queue (pending)',
          attributes: {
            category: 'lido-redeem-queue-pending',
            position_id: `${QUEUE}-pending`,
            deposits: [
              makeWithdrawalLeg('lido-redeem-queue-pending', '5000000', 5),
            ],
          },
        }),
      ],
    });
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({
      name: 'Withdrawal pending',
      amount: 5,
    });
    expect(tokens[0]).not.toHaveProperty('activityTypes');
  });

  it('skips an empty part and a position with an incomplete value', () => {
    expect(
      withdrawalRowToPortfolioTokens(
        makePosition({
          attributes: {
            category: 'lido-withdrawal-request',
            deposits: [makeWithdrawalLeg('lido-withdrawal-request', '0', 0)],
          },
        }),
      ),
    ).toEqual([]);
    expect(
      withdrawalRowToPortfolioTokens(
        makePosition({
          attributes: {
            category: 'lido-withdrawal-request',
            value_incomplete: true,
          },
        }),
      ),
    ).toEqual([]);
  });

  it('leaves other positions to the usual mapping', () => {
    expect(withdrawalRowToPortfolioTokens(makePosition())).toBeNull();
  });
});

describe('positionRowToPortfolioToken', () => {
  it('maps a Lido stETH position with its pnl key', () => {
    expect(positionRowToPortfolioToken(makePosition())).toEqual({
      id: 'pos-1',
      chainId: 1,
      chainSlug: 'ethereum',
      chainName: 'Ethereum',
      address: STETH,
      isNative: false,
      symbol: 'stETH',
      name: 'Liquid staked Ether 2.0',
      decimals: 18,
      amountRaw: '2000000000000000000',
      amount: 2,
      priceUsd: 3000,
      valueUsd: 6000,
      isLido: true,
      pnl: { category: 'lido-steth-staking', positionId: STETH },
    });
  });

  it('keeps a Lido position below $1', () => {
    expect(
      positionRowToPortfolioToken(makePosition({ value_usd: 0.2 })),
    ).not.toBeNull();
  });

  it('lowercases the Lido position id', () => {
    const token = positionRowToPortfolioToken(
      makePosition({
        attributes: { position_id: STETH.toUpperCase().replace('0X', '0x') },
      }),
    );
    expect(token?.address).toBe(STETH);
    expect(token?.isLido).toBe(true);
  });

  it('maps a non-Lido single-leg position without an address', () => {
    const token = positionRowToPortfolioToken(
      makePosition({
        name: 'Deposit',
        defi_name: '0xSplits',
        attributes: {
          category: '0xsplits-deposit-v1',
          position_id: '0x2ed6c4b5da6378c7897ac67ba9e43102feb694ee',
        },
      }),
    );
    expect(token).toMatchObject({
      name: '0xSplits Deposit',
      symbol: 'stETH',
      address: null,
      isLido: false,
      amount: 2,
    });
  });

  it('does not repeat the protocol name', () => {
    const token = positionRowToPortfolioToken(
      makePosition({
        name: 'Aave V3 Lending',
        defi_name: 'Aave V3',
        attributes: { category: 'aave-v3-supply', position_id: '0x1' },
      }),
    );
    expect(token?.name).toBe('Aave V3 Lending');
  });

  it('keeps a legit protocol name with a dot', () => {
    const token = positionRowToPortfolioToken(
      makePosition({
        name: 'Liquidity Pool',
        defi_name: 'Curve.fi',
        attributes: { category: 'curve', position_id: '0x2' },
      }),
    );
    expect(token?.name).toBe('Curve.fi Liquidity Pool');
  });

  it('keeps a debt position with a negative value', () => {
    const token = positionRowToPortfolioToken(
      makePosition({
        value_usd: -500,
        name: 'Lending',
        defi_name: 'Aave V3',
        attributes: { category: 'aave-v3-borrow', position_id: '0x3' },
      }),
    );
    expect(token?.valueUsd).toBe(-500);
  });

  it('has no amount for a multi-leg position', () => {
    const token = positionRowToPortfolioToken(
      makePosition({
        defi_name: 'Uniswap',
        name: 'LiquidityPool',
        attributes: {
          category: 'uni-v3-supply',
          position_id: '123',
          deposits: [makeLeg(), makeLeg({ token_symbol: 'WETH' })],
        },
      }),
    );
    expect(token).toMatchObject({
      symbol: 'stETH+WETH',
      decimals: null,
      amountRaw: '',
      amount: 0,
      priceUsd: null,
    });
  });

  it('drops non-Lido dust and incomplete values', () => {
    const other = { position_id: '0x2ed6c4b5da6378c7897ac67ba9e43102feb694ee' };
    expect(
      positionRowToPortfolioToken(
        makePosition({ value_usd: 0.5, attributes: other }),
      ),
    ).toBeNull();
    expect(
      positionRowToPortfolioToken(
        makePosition({ attributes: { ...other, value_incomplete: true } }),
      ),
    ).toBeNull();
  });

  it('is parsed next to token rows', () => {
    const { tokens } = parsePositionsResponse({
      positions: [makeRow({ id: 'tok', value_usd: 100 }), makePosition()],
    });
    expect(tokens.map((t) => t.id)).toEqual(['pos-1', 'tok']);
  });
});

describe('parsePositionsResponse limits', () => {
  it('keeps all Lido rows and the top 100 other rows', () => {
    const others = Array.from({ length: 120 }, (_, index) =>
      makeRow({ id: `o${index}`, value_usd: 1000 + index }),
    );
    const { tokens, dataIncomplete } = parsePositionsResponse({
      positions: [...others, makePosition({ value_usd: 1 })],
    });
    expect(tokens.filter((token) => token.isLido)).toHaveLength(1);
    expect(tokens.filter((token) => !token.isLido)).toHaveLength(100);
    expect(tokens.find((token) => !token.isLido)?.id).toBe('o119');
    expect(dataIncomplete).toBe(true);
  });

  it('marks data incomplete and warns when rows are skipped', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { dataIncomplete } = parsePositionsResponse({
      positions: [{ type: 'token', broken: true }, makeRow()],
    });
    expect(dataIncomplete).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
